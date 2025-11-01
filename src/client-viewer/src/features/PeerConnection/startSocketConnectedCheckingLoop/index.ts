import PeerConnection from '..';
import { ErrorMessage } from '../../../components/ErrorDialog/ErrorMessageEnum';
import setAndShowErrorDialogMessage from '../setAndShowErrorDialogMessage';

export default (peerConnection: PeerConnection) => {
  let disconnectedStreak = 0;
  setInterval(() => {
    const isConnected = !!peerConnection.socket?.connected;
    if (isConnected) {
      disconnectedStreak = 0;
      return;
    }

    // do not show errors if the media stream has already started
    if (peerConnection.isStreamStarted) return;

    disconnectedStreak++;

    // show a disconnect error only after sustained disconnection
    if (disconnectedStreak >= 5) {
      setAndShowErrorDialogMessage(peerConnection, ErrorMessage.DISCONNECTED);
    }
  }, 2000);
};
