import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Grid } from 'react-flexbox-grid';
import screenfull from 'screenfull';
import './index.css';
import PeerConnection from '../../features/PeerConnection';
import { AppContext } from '../../providers/AppContextProvider';
import { VideoQuality } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import ErrorDialog from '../../components/ErrorDialog';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
import ConnectionPropmpts from '../../containers/ConnectionPrompts';
import PlayerView from '../../containers/PlayerView';
import handleSetVideoQuality from './handleSetVideoQuality';
import { DUMMY_MY_DEVICE_DETAILS } from '../../constants/appConstants';
import handleNoConnectionTimeout from './handleNoConnectionTimeout';
import handleCreatePeerConnection from './handleCreatePeerConnection';
import handleRemoveDanglingReactRevealContainer from './handleRemoveDanglingReactRevealContainer';
import handleDisplayingLoadingSharingIconLoop from './handleDisplayingLoadingSharingIconLoop';

function MainView() {
  const { isDarkTheme, setIsDarkThemeHook } = useContext(AppContext);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const [promptStep, setPromptStep] = useState(1);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.UNKNOWN_ERROR
  );
  const [connectionIconType, setConnectionIconType] = useState<
    ConnectionIconType
  >('feed');
  const [myDeviceDetails, setMyDeviceDetails] = useState<DeviceDetails>(
    DUMMY_MY_DEVICE_DETAILS
  );

  const [playing, setPlaying] = useState(true);
  const [isFullScreenOn, setIsFullScreenOn] = useState(false);
  const [url, setUrl] = useState<undefined | MediaStream>(undefined);
  const [screenSharingSourceType, setScreenSharingSourceType] = useState<
    ScreenSharingSourceType
  >('screen');
  const [isWithControls, setIsWithControls] = useState(!screenfull.isEnabled);
  const [isShownTextPrompt, setIsShownTextPrompt] = useState(false);
  const [isShownLoadingSharingIcon, setIsShownLoadingSharingIcon] = useState(
    false
  );
  const [loadingSharingIconType, setLoadingSharingIconType] = useState<
    LoadingSharingIconType
  >('desktop');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>(
    VideoQuality.Q_AUTO
  );
  const [peer, setPeer] = useState<undefined | PeerConnection>();

  useEffect(handleSetVideoQuality(videoQuality, peer), [videoQuality, peer]);

  useEffect(handleNoConnectionTimeout(myDeviceDetails, setIsErrorDialogOpen), [
    myDeviceDetails,
  ]);

  useEffect(
    handleCreatePeerConnection({
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
    }),
    [setIsDarkThemeHook, isDarkTheme, peer]
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
        isOpen={url === undefined ? true : false}
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
        isFullScreenOn={isFullScreenOn}
        setIsFullScreenOn={setIsFullScreenOn}
        handlePlayPause={handlePlayPause}
        isPlaying={playing}
        setVideoQuality={setVideoQuality}
        videoQuality={videoQuality}
      />
      <ErrorDialog
        errorMessage={dialogErrorMessage}
        isOpen={isErrorDialogOpen}
      />
    </Grid>
  );
}

export default MainView;
