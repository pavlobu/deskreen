import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
import { process as processMessage } from '../../utils/message';
import NullUser from './NullUser';
import PeerConnectionUserIsNotDefinedError from './errors/PeerConnectionUserIsNotDefinedError';
import setAndShowErrorDialogMessage from './setAndShowErrorDialogMessage';

export default async (peerConnection: PeerConnection, payload: ReceiveEncryptedMessagePayload) => {
  if (peerConnection.user === NullUser) {
    throw new PeerConnectionUserIsNotDefinedError();
  }
  const message = await processMessage(payload);
  // const message = payload as any;
  if (message.type === 'CALL_USER') {
    peerConnection.peer?.signal(message.payload.signalData);
  }
  if (message.type === 'DENY_TO_CONNECT') {
    setAndShowErrorDialogMessage(peerConnection, ErrorMessage.DENY_TO_CONNECT);
  }
  if (message.type === 'DISCONNECT_BY_HOST_MACHINE_USER') {
    setAndShowErrorDialogMessage(peerConnection, ErrorMessage.DISCONNECTED);
  }
  if (message.type === 'ALLOWED_TO_CONNECT') {
    peerConnection.UIHandler.hostAllowedToConnectCallback();
  }
  if (message.type === 'APP_LANGUAGE') {
    peerConnection.UIHandler.setAppLanguageCallback(message.payload.value);
  }
};
