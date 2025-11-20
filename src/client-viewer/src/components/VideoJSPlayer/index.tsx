import { useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore no types provided by video.js in this setup
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './videojs-contain.css';

interface VideoJSPlayerProps {
	stream: MediaStream | null;
	playing: boolean;
	containerEl: HTMLElement | null;
}

type VideoJsPlayerInstance = {
	play?: () => void | Promise<void>;
	pause?: () => void;
	dispose?: () => void;
};

function VideoJSPlayer(props: VideoJSPlayerProps) {
	const { stream, playing, containerEl } = props;
	const videoElRef = useRef<HTMLVideoElement | null>(null);
	const playerRef = useRef<VideoJsPlayerInstance | null>(null);

	useEffect(() => {
		if (!containerEl || !videojs) return;
		if (playerRef.current) return;

		const videoEl = document.createElement('video');
		videoEl.className = 'video-js vjs-default-skin';
		videoEl.setAttribute('playsinline', 'true');
		videoEl.setAttribute('webkit-playsinline', 'true');
		videoEl.muted = true; // allow autoplay on mobile/safari
		videoEl.style.width = '100%';
		videoEl.style.height = '100%';
		videoEl.style.objectFit = 'contain';
		videoEl.style.backgroundColor = 'black';
		// set container background to black to show letterboxing
		try {
			containerEl.style.backgroundColor = 'black';
		} catch {
			// ignore styling errors
		}
		containerEl.appendChild(videoEl);
		videoElRef.current = videoEl;

		playerRef.current = videojs(videoEl, {
			controls: false,
			autoplay: false,
			preload: 'auto',
			fluid: false,
			fill: false,
			responsive: false,
			inactivityTimeout: 0,
		});

		return () => {
			try {
				if (playerRef.current) {
					const instance = playerRef.current;
					instance.dispose?.();
					playerRef.current = null;
				}
			} finally {
				if (videoElRef.current && videoElRef.current.parentNode) {
					videoElRef.current.parentNode.removeChild(videoElRef.current);
				}
				videoElRef.current = null;
			}
		};
	}, [containerEl]);

	useEffect(() => {
		const el = videoElRef.current;
		if (!el) return;
		try {
			if (stream instanceof MediaStream) {
				// @ts-ignore srcObject exists on HTMLMediaElement
				el.srcObject = stream;
				el.style.objectFit = 'contain';
				el.style.backgroundColor = 'black';
				if (playing) {
					// attempt play after attaching
					const p = el.play();
					if (p && typeof p.catch === 'function') {
						p.catch(() => {
							// ignore autoplay failures
						});
					}
				}
			} else {
				// @ts-ignore
				el.srcObject = null;
				el.removeAttribute('src');
				el.load();
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Failed to attach MediaStream to element', e);
		}
	}, [stream, playing]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player) return;
		if (playing) {
			player.play && player.play();
		} else {
			player.pause && player.pause();
		}
	}, [playing]);

	return null;
}

export default VideoJSPlayer;
