/// <reference types="react-scripts" />

const ConnectionIconEnum = import('./containers/MainView/ConnectionIconEnum').default;
const LoadingSharingIconEnum = import('./containers/MainView/LoadingSharingIconEnum').default;
const ScreenSharingSourceEnum = import('./features/PeerConnection/ScreenSharingSourceEnum').default;

type ConnectionIconType = ConnectionIconEnum.FEED | ConnectionIconEnum.FEED_SUBSCRIBED;
type LoadingSharingIconType = LoadingSharingIconEnum.DESKTOP | LoadingSharingIconEnum.APPLICATION;
type ScreenSharingSourceType =
  | ScreenSharingSourceEnum.SCREEN
  | ScreenSharingSourceEnum.WINDOW;
type CreatePeerConnectionUseEffectParams = {
  isDarkTheme: boolean;
  peer: undefined | PeerConnection;
  setIsDarkThemeHook: (_: boolean) => void;
  setMyDeviceDetails: (_: DeviceDetails) => void;
  setConnectionIconType: (_: ConnectionIconType) => void;
  setIsShownTextPrompt: (_: boolean) => void;
  setPromptStep: (_: number) => void;
  setScreenSharingSourceType: (_: ScreenSharingSourceType) => void;
  setDialogErrorMessage: (_: ErrorMessage) => void;
  setIsErrorDialogOpen: (_: boolean) => void;
  setUrl: (_: MediaStream) => void;
  setPeer: (_: PeerConnection) => void;
};
type handleDisplayingLoadingSharingIconLoopParams = {
  promptStep: number;
  url: undefined | MediaStream;
  setIsShownLoadingSharingIcon: (_: boolean) => void;
  loadingSharingIconType: LoadingSharingIconType;
  isShownLoadingSharingIcon: boolean;
  setLoadingSharingIconType: (_: LoadingSharingIconType) => void;
};
