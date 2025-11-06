import { ErrorMessage, type ErrorMessageType } from '../../components/ErrorDialog/ErrorMessageEnum';

export default (peerConnection: PeerConnection, errorMessage: ErrorMessageType) => {
  // allow showing disconnect errors even when stream is started
  const isDisconnectError = errorMessage === ErrorMessage.DISCONNECTED;
  if (peerConnection.isStreamStarted && !isDisconnectError) {
    // avoid flashing an error if the stream already started (except for disconnect errors)
    return;
  }
  if (peerConnection.UIHandler.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR || isDisconnectError) {
    peerConnection.UIHandler.setDialogErrorMessageCallback(errorMessage);
    peerConnection.UIHandler.setIsErrorDialogOpen(true);
    peerConnection.UIHandler.errorDialogMessage = errorMessage;
  }
};
