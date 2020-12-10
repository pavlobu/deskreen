/// <reference types="react-scripts" />

type ConnectionIconType = 'feed' | 'feed-subscribed';
type LoadingSharingIconType = 'desktop' | 'application';
type ScreenSharingSourceType = 'screen' | 'window';
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
