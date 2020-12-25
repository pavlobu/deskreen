import PeerConnection from '../../features/PeerConnection';
import PeerConnectionUIHandler from '../../features/PeerConnection/PeerConnectionUIHandler';
import getRoomIDOfCurrentBrowserWindow from '../../utils/getRoomIDOfCurrentBrowserWindow';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../../features/VideoAutoQualityOptimizer';
import changeLanguage from './changeLanguage';
import ConnectionIcon from './ConnectionIconEnum';

export default (params: CreatePeerConnectionUseEffectParams) => {
  const {
    isDarkTheme,
    peer,
    setIsDarkThemeHook,
    setMyDeviceDetails,
    setConnectionIconType,
    setIsShownTextPrompt,
    setPromptStep,
    setScreenSharingSourceType,
    setDialogErrorMessage,
    setIsErrorDialogOpen,
    setUrl,
    setPeer,
  } = params;

  return () => {
    if (!peer) {
      const UIHandler = new PeerConnectionUIHandler(
        isDarkTheme,
        setMyDeviceDetails,
        () => {
          setConnectionIconType(ConnectionIcon.FEED_SUBSCRIBED);

          setIsShownTextPrompt(false);
          setIsShownTextPrompt(true);
          setPromptStep(2);

          setTimeout(() => {
            setIsShownTextPrompt(false);
            setIsShownTextPrompt(true);
            setPromptStep(3);
          }, 2000);
        },
        setScreenSharingSourceType,
        setIsDarkThemeHook,
        changeLanguage,
        setDialogErrorMessage,
        setIsErrorDialogOpen
      );

      const _peer = new PeerConnection(
        getRoomIDOfCurrentBrowserWindow(),
        setUrl,
        new Crypto(),
        new VideoAutoQualityOptimizer(),
        UIHandler
      );

      setPeer(_peer);

      setTimeout(() => {
        setIsShownTextPrompt(true);
      }, 100);
    }
  };
};
