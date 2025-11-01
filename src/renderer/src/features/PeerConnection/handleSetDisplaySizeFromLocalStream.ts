export default function setDisplaySizeFromLocalStream(peerConnection: PeerConnection): void {
  if (!peerConnection.localStream || !peerConnection.localStream.getVideoTracks()[0]) return;
  if (!peerConnection.localStream.getVideoTracks()[0].getSettings().width) return;
  if (!peerConnection.localStream.getVideoTracks()[0].getSettings().height) return;
  peerConnection.sourceDisplaySize = {
    width: peerConnection.localStream.getVideoTracks()[0].getSettings().width
      ? (peerConnection.localStream.getVideoTracks()[0].getSettings().width as number)
      : 640,
    height: peerConnection.localStream.getVideoTracks()[0].getSettings().height
      ? (peerConnection.localStream.getVideoTracks()[0].getSettings().height as number)
      : 480,
  };
}
