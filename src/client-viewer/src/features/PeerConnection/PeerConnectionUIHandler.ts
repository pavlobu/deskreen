import { ErrorMessage, type ErrorMessageType } from '../../components/ErrorDialog/ErrorMessageEnum';

export default class PeerConnectionUIHandler {
  isDarkTheme: boolean;

  setMyDeviceDetails: (details: DeviceDetails) => void;

  hostAllowedToConnectCallback: () => void;

  setScreenSharingSourceTypeCallback: (s: ScreenSharingSourceType) => void;

  setIsDarkThemeCallback: (val: boolean) => void;

  setAppLanguageCallback: (newLang: string) => void;

  setDialogErrorMessageCallback: (message: ErrorMessageType) => void;

  setIsErrorDialogOpen: (val: boolean) => void;

  errorDialogMessage: ErrorMessageType = ErrorMessage.UNKNOWN_ERROR;

  constructor(
    isDarkTheme: boolean,
    setMyDeviceDetails: (details: DeviceDetails) => void,
    hostAllowedToConnectCallback: () => void,
    setScreenSharingSourceTypeCallback: (s: ScreenSharingSourceType) => void,
    setIsDarkThemeCallback: (val: boolean) => void,
    setAppLanguageCallback: (newLang: string) => void,
    setDialogErrorMessageCallback: (message: ErrorMessageType) => void,
    setIsErrorDialogOpen: (val: boolean) => void
  ) {
    this.isDarkTheme = isDarkTheme;
    this.hostAllowedToConnectCallback = hostAllowedToConnectCallback;
    this.setMyDeviceDetails = setMyDeviceDetails;
    this.setScreenSharingSourceTypeCallback = setScreenSharingSourceTypeCallback;
    this.setIsDarkThemeCallback = setIsDarkThemeCallback;
    this.setAppLanguageCallback = setAppLanguageCallback;
    this.setDialogErrorMessageCallback = setDialogErrorMessageCallback;
    this.setIsErrorDialogOpen = setIsErrorDialogOpen;
  }
}
