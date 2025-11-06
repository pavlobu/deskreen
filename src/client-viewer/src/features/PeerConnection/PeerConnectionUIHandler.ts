import { ErrorMessage, type ErrorMessageType } from '../../components/ErrorDialog/ErrorMessageEnum';

export default class PeerConnectionUIHandler {
  setMyDeviceDetails: (details: DeviceDetails) => void;

  hostAllowedToConnectCallback: () => void;

  setScreenSharingSourceTypeCallback: (s: ScreenSharingSourceType) => void;

  setAppLanguageCallback: (newLang: string) => void;

  setDialogErrorMessageCallback: (message: ErrorMessageType) => void;

  setIsErrorDialogOpen: (val: boolean) => void;

  errorDialogMessage: ErrorMessageType = ErrorMessage.UNKNOWN_ERROR;

  constructor(
    setMyDeviceDetails: (details: DeviceDetails) => void,
    hostAllowedToConnectCallback: () => void,
    setScreenSharingSourceTypeCallback: (s: ScreenSharingSourceType) => void,
    setAppLanguageCallback: (newLang: string) => void,
    setDialogErrorMessageCallback: (message: ErrorMessageType) => void,
    setIsErrorDialogOpen: (val: boolean) => void
  ) {
    this.hostAllowedToConnectCallback = hostAllowedToConnectCallback;
    this.setMyDeviceDetails = setMyDeviceDetails;
    this.setScreenSharingSourceTypeCallback = setScreenSharingSourceTypeCallback;
    this.setAppLanguageCallback = setAppLanguageCallback;
    this.setDialogErrorMessageCallback = setDialogErrorMessageCallback;
    this.setIsErrorDialogOpen = setIsErrorDialogOpen;
  }
}
