import PeerConnection from '..';
import { ErrorMessage } from '../../../components/ErrorDialog/ErrorMessageEnum';
import setAndShowErrorDialogMessage from '../setAndShowErrorDialogMessage';

export default (peerConnection: PeerConnection) => {
  setInterval(() => {
    if (!peerConnection.socket.connected) {
      setAndShowErrorDialogMessage(peerConnection, ErrorMessage.DENY_TO_CONNECT);
    }
  }, 2000);
};
