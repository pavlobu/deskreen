import PeerConnection from "../../features/PeerConnection";
import { VideoQuality } from "../../features/VideoAutoQualityOptimizer/VideoQualityEnum";

export default (
  videoQuality: VideoQuality,
  peer: PeerConnection | undefined
) => {
  return () => {
    if (!peer) return;
    if (!peer.isStreamStarted) return;
    peer.setVideoQuality(videoQuality);
  };
};
