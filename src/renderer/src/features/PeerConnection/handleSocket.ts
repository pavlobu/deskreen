import handleSocketUserEnter from './handleSocketUserEnter';
import handleSocketUserExit from './handleSocketUserExit';

export default function handleSocket(peerConnection: PeerConnection): void {
  peerConnection.socket.removeAllListeners();

  peerConnection.socket.on('disconnect', () => {
    peerConnection.selfDestroy();
  });

  peerConnection.socket.on('error', (error: Error) => {
    console.error('peerConnection socket error', error);
    peerConnection.selfDestroy();
  });

  peerConnection.socket.on('connect', () => {
    peerConnection.emitUserEnter();
  });

  peerConnection.socket.on('USER_ENTER', (payload: { users: PartnerPeerUser[] }) => {
    handleSocketUserEnter(peerConnection, payload);
  });

  peerConnection.socket.on('USER_EXIT', () => {
    handleSocketUserExit(peerConnection);
  });

  peerConnection.socket.on('ENCRYPTED_MESSAGE', (payload: ReceiveEncryptedMessagePayload) => {
    peerConnection.receiveEncryptedMessage(payload);
  });

  peerConnection.socket.on('USER_DISCONNECT', () => {
    peerConnection.toggleLockRoom(false);
  });
}
