export default (peerConnection: PeerConnection, payload: { users: PartnerPeerUser[] }): void => {
  const filteredPartner = payload.users.filter((user: PartnerPeerUser) => {
    return peerConnection.user.username !== user.username;
  });

  if (filteredPartner[0] === undefined) return;

  [peerConnection.partner] = filteredPartner;

  if (peerConnection.partner.publicKey !== '') {
    // peerConnection.socket.emit('TOGGLE_LOCK_ROOM', null, () => {});
    // peerConnection.isSocketRoomLocked = true;
    peerConnection.toggleLockRoom(true);
    peerConnection.emitUserEnter();
  }
};
