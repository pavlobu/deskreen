import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';

export default (peerConnection: PeerConnection, errorMessage: ErrorMessage) => {
  if (
    peerConnection.UIHandler.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR
  ) {
    peerConnection.UIHandler.setDialogErrorMessageCallback(errorMessage);
    peerConnection.UIHandler.setIsErrorDialogOpen(true);
    peerConnection.UIHandler.errorDialogMessage = errorMessage;
  }
};
