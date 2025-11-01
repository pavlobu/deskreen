import { useEffect, useState, useContext, useCallback } from 'react';
import { Grid } from 'react-flexbox-grid';
import screenfull from 'screenfull';
import './index.css';
import PeerConnection from '../../features/PeerConnection';
import { AppContext } from '../../providers/AppContextProvider';
import { VideoQuality, type VideoQualityType } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import ErrorDialog from '../../components/ErrorDialog';
import { ErrorMessage, type ErrorMessageType } from '../../components/ErrorDialog/ErrorMessageEnum';
import ConnectionPropmpts from '../../containers/ConnectionPrompts';
import PlayerView from '../../containers/PlayerView';
import handleSetVideoQuality from './handleSetVideoQuality';
import { DUMMY_MY_DEVICE_DETAILS } from '../../constants/appConstants';
import handleNoConnectionTimeout from './handleNoConnectionTimeout';
import handleCreatePeerConnection from './handleCreatePeerConnection';
import handleRemoveDanglingReactRevealContainer from './handleRemoveDanglingReactRevealContainer';
import handleDisplayingLoadingSharingIconLoop from './handleDisplayingLoadingSharingIconLoop';
import { ScreenSharingSource } from '../../features/PeerConnection/ScreenSharingSourceEnum';
import ConnectionIcon from './ConnectionIconEnum';
import { LoadingSharingIconEnum } from './LoadingSharingIconEnum';

function MainView() {
  const { isDarkTheme, setIsDarkThemeHook } = useContext(AppContext);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const [promptStep, setPromptStep] = useState(1);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<ErrorMessageType>(
    ErrorMessage.UNKNOWN_ERROR
  );
  const [connectionIconType, setConnectionIconType] = useState<
    ConnectionIconType
  >(ConnectionIcon.FEED);
  const [myDeviceDetails, setMyDeviceDetails] = useState<DeviceDetails>(
    DUMMY_MY_DEVICE_DETAILS
  );

	const [playing, setPlaying] = useState(true);
  const [url, setUrl] = useState<undefined | MediaStream>(undefined);
  const [screenSharingSourceType, setScreenSharingSourceType] = useState<
    ScreenSharingSourceType
  >(ScreenSharingSource.SCREEN);
  const [isWithControls, setIsWithControls] = useState(!screenfull.isEnabled);
  const [isShownTextPrompt, setIsShownTextPrompt] = useState(false);
  const [isShownLoadingSharingIcon, setIsShownLoadingSharingIcon] = useState(
    false
  );
  const [loadingSharingIconType, setLoadingSharingIconType] = useState<
    LoadingSharingIconType
  >(LoadingSharingIconEnum.DESKTOP);
  const [videoQuality, setVideoQuality] = useState<VideoQualityType>(
    VideoQuality.Q_100_PERCENT
  );
  const [peer, setPeer] = useState<undefined | PeerConnection>();
  const [connectionRoomId, setConnectionRoomId] = useState<string>('');

  useEffect(() => {
    const { pathname } = window.location;
    const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const extractedRoomId = normalizedPath.split('/').filter(Boolean)[0] || '';

    if (extractedRoomId !== '') {
      setConnectionRoomId(extractedRoomId);
      return;
    }

    const fallbackRoomId = Math.random().toString(36).substring(2, 10);
    setConnectionRoomId(fallbackRoomId);
  }, []);

  useEffect(handleSetVideoQuality(videoQuality, peer), [videoQuality, peer]);

  useEffect(handleNoConnectionTimeout(myDeviceDetails, setIsErrorDialogOpen), [
    myDeviceDetails,
  ]);

  useEffect(
    handleCreatePeerConnection({
      isDarkTheme,
      peer,
      connectionRoomId,
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
    }),
    [setIsDarkThemeHook, isDarkTheme, peer, connectionRoomId]
  );

  const handlePlayPause = useCallback(() => {
    setPlaying(!playing);
  }, [playing]);

  useEffect(handleRemoveDanglingReactRevealContainer(url), [url]);

  useEffect(
    handleDisplayingLoadingSharingIconLoop({
      promptStep,
      url,
      setIsShownLoadingSharingIcon,
      loadingSharingIconType,
      isShownLoadingSharingIcon,
      setLoadingSharingIconType,
    }),
    [promptStep, url]
  );

  return (
    <Grid>
      <ConnectionPropmpts
        myDeviceDetails={myDeviceDetails}
        isShownTextPrompt={isShownTextPrompt}
        promptStep={promptStep}
        connectionIconType={connectionIconType}
        spinnerIconType={loadingSharingIconType}
        isShownSpinnerIcon={isShownLoadingSharingIcon}
      />
		<PlayerView
			streamUrl={url}
			screenSharingSourceType={screenSharingSourceType}
			setIsWithControls={setIsWithControls}
			isWithControls={isWithControls}
			handlePlayPause={handlePlayPause}
			isPlaying={playing}
			setVideoQuality={setVideoQuality}
			videoQuality={videoQuality}
			isDarkTheme={isDarkTheme}
		/>
      <ErrorDialog
        errorMessage={dialogErrorMessage}
        isOpen={isErrorDialogOpen}
        setIsOpen={setIsErrorDialogOpen}
      />
    </Grid>
  );
}

export default MainView;
