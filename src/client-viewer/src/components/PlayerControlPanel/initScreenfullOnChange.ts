import { subscribeToPlayerFullscreenChange } from '../../utils/playerFullscreen';

export default (setIsFullScreenOn: (_: boolean) => void) => {
	const unsubscribe = subscribeToPlayerFullscreenChange(setIsFullScreenOn);
	return () => {
		unsubscribe();
	};
};
