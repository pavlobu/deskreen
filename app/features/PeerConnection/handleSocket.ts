import handleSocketUserEnter from './handleSocketUserEnter';
import handleSocketUserExit from './handleSocketUserExit';

export default function handleSocket(peerConnection: PeerConnection) {
  peerConnection.socket.removeAllListeners();

  peerConnection.socket.on('disconnect', () => {
    peerConnection.selfDestroy();
  });

  peerConnection.socket.on('connect', () => {
    // peerConnection.emitUserEnter();
  });

  peerConnection.socket.on(
    'USER_ENTER',
    (payload: { users: PartnerPeerUser[] }) => {
      handleSocketUserEnter(peerConnection, payload);
    }
  );

  peerConnection.socket.on('USER_EXIT', () => {
    handleSocketUserExit(peerConnection);
  });

  peerConnection.socket.on(
    'ENCRYPTED_MESSAGE',
    (payload: ReceiveEncryptedMessagePayload) => {
      peerConnection.receiveEncryptedMessage(payload);
    }
  );

  peerConnection.socket.on('USER_DISCONNECT', () => {
    peerConnection.toggleLockRoom(false);
  });

  // socketConnection.on('TOGGLE_LOCK_ROOM', payload => {
  //   peerConnection.props.receiveUnencryptedMessage('TOGGLE_LOCK_ROOM', payload);
  // });

  // socketConnection.on('ROOM_LOCKED', payload => {
  //   peerConnection.props.openModal('Room Locked');
  // });
}
