export default (peerConnection: PeerConnection): void => {
  if (peerConnection.isSocketRoomLocked) {
    peerConnection.toggleLockRoom(false);
    if (peerConnection.isCallStarted) {
      // TODO: display toast device is gone ....
      peerConnection.selfDestroy();
    }
  }
};
