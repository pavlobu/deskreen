export default (peerConnection: PeerConnection) => {
  if (peerConnection.isSocketRoomLocked) {
    peerConnection.toggleLockRoom(false);
    if (peerConnection.isCallStarted) {
      // TODO: display toast device is gone ....
      peerConnection.selfDestroy();
    }
  }
};
