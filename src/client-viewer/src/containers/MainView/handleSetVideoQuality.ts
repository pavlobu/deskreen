import PeerConnection from '../../features/PeerConnection';
import { type VideoQualityType } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';

export default (
	videoQuality: VideoQualityType,
	peer: PeerConnection | undefined,
) => {
	return () => {
		if (!peer) return;
		if (!peer.isStreamStarted) return;
		peer.setVideoQuality(videoQuality);
	};
};
