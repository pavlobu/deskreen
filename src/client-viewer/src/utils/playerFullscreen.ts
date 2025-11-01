import screenfull from 'screenfull';
import { PLAYER_WRAPPER_ID } from '../constants/appConstants';

type LegacyFullscreenElement = HTMLElement & {
	webkitRequestFullscreen?: () => Promise<void> | void;
	webkitRequestFullScreen?: () => Promise<void> | void;
	mozRequestFullScreen?: () => Promise<void> | void;
	msRequestFullscreen?: () => Promise<void> | void;
};

type LegacyFullscreenDocument = Document & {
	webkitExitFullscreen?: () => Promise<void> | void;
	mozCancelFullScreen?: () => Promise<void> | void;
	msExitFullscreen?: () => Promise<void> | void;
	webkitFullscreenElement?: Element | null;
	mozFullScreenElement?: Element | null;
	msFullscreenElement?: Element | null;
};

type IOSVideoElement = HTMLVideoElement & {
	webkitEnterFullscreen?: () => void;
	webkitExitFullscreen?: () => void;
	webkitSupportsFullscreen?: boolean;
	webkitDisplayingFullscreen?: boolean;
};

type Unsubscribe = () => void;

const fullscreenEventNames = [
	'fullscreenchange',
	'webkitfullscreenchange',
	'MSFullscreenChange',
	'mozfullscreenchange',
];

const getPlayerContainer = (): HTMLElement | null => {
	return document.getElementById(PLAYER_WRAPPER_ID);
};

const getPlayerVideo = (): IOSVideoElement | null => {
	const container = getPlayerContainer();
	if (!container) return null;
	const maybeVideo = container.querySelector('video');
	if (!(maybeVideo instanceof HTMLVideoElement)) return null;
	return maybeVideo as IOSVideoElement;
};

const requestStandardFullscreen = (element: HTMLElement | null): boolean => {
	if (!element) return false;
	const target = element as LegacyFullscreenElement;
	const request =
		target.requestFullscreen ||
		target.webkitRequestFullscreen ||
		target.webkitRequestFullScreen ||
		target.mozRequestFullScreen ||
		target.msRequestFullscreen;
	if (typeof request !== 'function') return false;
	request.call(target);
	return true;
};

const exitStandardFullscreen = (): boolean => {
	const doc = document as LegacyFullscreenDocument;
	const exit =
		doc.exitFullscreen ||
		doc.webkitExitFullscreen ||
		doc.mozCancelFullScreen ||
		doc.msExitFullscreen;
	if (typeof exit !== 'function') return false;
	exit.call(doc);
	return true;
};

export const isPlayerFullscreen = (): boolean => {
	const doc = document as LegacyFullscreenDocument;
	if (
		doc.fullscreenElement ||
		doc.webkitFullscreenElement ||
		doc.mozFullScreenElement ||
		doc.msFullscreenElement
	) {
		return true;
	}
	const video = getPlayerVideo();
	if (!video) return false;
	if (typeof video.webkitDisplayingFullscreen === 'boolean') {
		return video.webkitDisplayingFullscreen;
	}
	return false;
};

export const enterPlayerFullscreen = (): boolean => {
	const container = getPlayerContainer();
	if (container && screenfull.isEnabled) {
		screenfull.request(container);
		return true;
	}
	if (requestStandardFullscreen(container)) return true;
	const video = getPlayerVideo();
	if (requestStandardFullscreen(video)) return true;
	if (video && typeof video.webkitEnterFullscreen === 'function') {
		if (typeof video.webkitSupportsFullscreen === 'boolean' && !video.webkitSupportsFullscreen) {
			return false;
		}
		video.webkitEnterFullscreen();
		return true;
	}
	return false;
};

export const exitPlayerFullscreen = (): boolean => {
	if (screenfull.isEnabled && screenfull.isFullscreen) {
		screenfull.exit();
		return true;
	}
	if (exitStandardFullscreen()) return true;
	const video = getPlayerVideo();
	if (video && typeof video.webkitExitFullscreen === 'function') {
		if (typeof video.webkitDisplayingFullscreen === 'boolean' && !video.webkitDisplayingFullscreen) {
			return false;
		}
		video.webkitExitFullscreen();
		return true;
	}
	return false;
};

export const togglePlayerFullscreen = (): 'entered' | 'exited' | 'failed' => {
	if (isPlayerFullscreen()) {
		return exitPlayerFullscreen() ? 'exited' : 'failed';
	}
	return enterPlayerFullscreen() ? 'entered' : 'failed';
};

export const subscribeToPlayerFullscreenChange = (
	listener: (isFullscreen: boolean) => void
): Unsubscribe => {
	const handleChange = () => listener(isPlayerFullscreen());
	const handleVideoBegin = () => listener(true);
	const handleVideoEnd = () => listener(false);

	if (screenfull.isEnabled) {
		screenfull.on('change', handleChange);
	}

	fullscreenEventNames.forEach((eventName) => {
		document.addEventListener(eventName, handleChange);
	});

	let currentVideo: IOSVideoElement | null = null;

	const attachVideoListeners = (video: IOSVideoElement | null) => {
		if (currentVideo === video) return;
		if (currentVideo) {
			currentVideo.removeEventListener('webkitbeginfullscreen', handleVideoBegin);
			currentVideo.removeEventListener('webkitendfullscreen', handleVideoEnd);
		}
		currentVideo = video;
		if (currentVideo) {
			currentVideo.addEventListener('webkitbeginfullscreen', handleVideoBegin);
			currentVideo.addEventListener('webkitendfullscreen', handleVideoEnd);
		}
	};

	attachVideoListeners(getPlayerVideo());

	const container = getPlayerContainer();
	let observer: MutationObserver | null = null;

	if (container) {
		observer = new MutationObserver(() => {
			attachVideoListeners(getPlayerVideo());
		});
		observer.observe(container, { childList: true, subtree: true });
	}

	listener(isPlayerFullscreen());

	return () => {
		if (screenfull.isEnabled) {
			screenfull.off('change', handleChange);
		}
		fullscreenEventNames.forEach((eventName) => {
			document.removeEventListener(eventName, handleChange);
		});
		if (currentVideo) {
			currentVideo.removeEventListener('webkitbeginfullscreen', handleVideoBegin);
			currentVideo.removeEventListener('webkitendfullscreen', handleVideoEnd);
		}
		if (observer) {
			observer.disconnect();
		}
	};
};

