import { ErrorMessage, type ErrorMessageType } from '../../components/ErrorDialog/ErrorMessageEnum';

export default (peerConnection: PeerConnection, errorMessage: ErrorMessageType) => {
  // avoid flashing an error if the stream already started
  if (peerConnection.isStreamStarted) return;
  if (peerConnection.UIHandler.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
    peerConnection.UIHandler.setDialogErrorMessageCallback(errorMessage);
    peerConnection.UIHandler.setIsErrorDialogOpen(true);
    peerConnection.UIHandler.errorDialogMessage = errorMessage;
  }
};
