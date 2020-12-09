import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './config/i18n';
import { H3, Position, Toaster } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { findDOMNode } from 'react-dom';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import Crypto from './utils/crypto';
import './App.css';
import PeerConnection from './features/PeerConnection';
import VideoAutoQualityOptimizer from './features/VideoAutoQualityOptimizer';
import ConnectingIndicator from './components/ConnectingIndicator';
import MyDeviceInfoCard from './components/MyDeviceInfoCard';
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
} from './constants/styleConstants';
import { AppContext } from './providers/AppContextProvider';
import PlayerControlPanel from './components/PlayerControlPanel';
import { VideoQuality } from './features/PeerConnection/VideoQualityEnum';
import { REACT_PLAYER_WRAPPER_ID } from './constants/appConstants';
import { TFunction } from 'i18next';
import ErrorDialog from './components/ErrorDialog';
import { ErrorMessage } from './components/ErrorDialog/ErrorMessageEnum';

const Fade = require('react-reveal/Fade');
const Slide = require('react-reveal/Slide');

function getPromptContent(step: number, t: TFunction) {
  switch (step) {
    case 1:
      return (
        <H3>
          {t(
            'Waiting for user to click ALLOW button on screen sharing device...'
          )}
        </H3>
      );
    case 2:
      return <H3>Connected!</H3>;
    case 3:
      return (
        <H3>
          {t(
            'Wating for user to select source to share from screen sharing device...'
          )}
        </H3>
      );
    default:
      return <H3>Error occured :(</H3>;
  }
}

function App() {
  const { t } = useTranslation();
  const { isDarkTheme, setIsDarkThemeHook } = useContext(AppContext);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const [toaster, setToaster] = useState<undefined | Toaster>();

  const refHandlers = {
    toaster: (ref: Toaster) => {
      setToaster(ref);
    },
  };

  const player = useRef(null);
  const [promptStep, setPromptStep] = useState(1);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.UNKNOWN_ERROR
  );
  const [connectionIconType, setConnectionIconType] = useState<
    'feed' | 'feed-subscribed'
  >('feed');
  const [myDeviceDetails, setMyDeviceDetails] = useState<DeviceDetails>({
    myIP: '',
    myOS: '',
    myDeviceType: '',
    myBrowser: '',
  });

  const [playing, setPlaying] = useState(true);
  const [isFullScreenOn, setIsFullScreenOn] = useState(false);
  const [url, setUrl] = useState();
  const [screenSharingSourceType, setScreenSharingSourceType] = useState<
    'screen' | 'window'
  >('screen');
  const [isWithControls, setIsWithControls] = useState(!screenfull.isEnabled);
  const [isShownTextPrompt, setIsShownTextPrompt] = useState(false);
  const [isShownSpinnerIcon, setIsShownSpinnerIcon] = useState(false);
  const [spinnerIconType, setSpinnerIconType] = useState<
    'desktop' | 'application'
  >('desktop');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>(
    VideoQuality.Q_AUTO
  );
  const [peer, setPeer] = useState<undefined | PeerConnection>();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (!peer) return;
    if (!peer.isStreamStarted) return;
    peer.setVideoQuality(videoQuality);
  }, [videoQuality, peer]);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkTheme
      ? DARK_UI_BACKGROUND
      : LIGHT_UI_BACKGROUND;
  }, [isDarkTheme]);

  useEffect(() => {
    if (!peer) {
      const _peer = new PeerConnection(
        setUrl,
        new Crypto(),
        new VideoAutoQualityOptimizer(),
        isDarkTheme,
        setMyDeviceDetails,
        () => {
          setConnectionIconType('feed-subscribed');

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

      setPeer(_peer);

      setTimeout(() => {
        setIsShownTextPrompt(true);
      }, 100);
    }
  }, [setIsDarkThemeHook, isDarkTheme, peer]);

  useEffect(() => {
    // infinite use effect
    setTimeout(() => {
      setIsShownSpinnerIcon(!isShownSpinnerIcon);
      setSpinnerIconType(
        spinnerIconType === 'desktop' ? 'application' : 'desktop'
      );
    }, 1500);
  }, [isShownSpinnerIcon, spinnerIconType]);

  const handlePlayPause = useCallback(() => {
    setPlaying(!playing);
  }, [playing]);

  useEffect(() => {
    if (url !== undefined) {
      setTimeout(() => {
        // @ts-ignore
        document.querySelector('.container > .react-reveal').style.display =
          'none';
      }, 1000);
    }
  }, [url]);

  useEffect(() => {
    if (promptStep === 3) {
      // start infinite use effect
      setIsShownSpinnerIcon(true);
    }
  }, [promptStep]);

  return (
    <Grid>
      <Slide
        id="connection-prompts-slide"
        bottom
        when={url === undefined ? true : false}
      >
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            boxShadow: `0 0 0 5px ${isDarkTheme ? '#000' : '#A7B6C2'}`,
            backgroundColor: isDarkTheme
              ? DARK_UI_BACKGROUND
              : LIGHT_UI_BACKGROUND,
          }}
        >
          <Row
            bottom="xs"
            style={{
              height: '50vh',
              width: '100%',
              marginRight: '0px',
              marginLeft: '0px',
            }}
          >
            <Row center="xs" style={{ width: '100%', margin: '0 auto' }}>
              <Col
                xs={12}
                style={{
                  marginBottom: '50px',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <div style={{ width: '100%' }}>
                  <Row center="xs" style={{ width: '100%', margin: '0 auto' }}>
                    <Col md={6} xl={4}>
                      <MyDeviceInfoCard deviceDetails={myDeviceDetails} />
                    </Col>
                  </Row>
                  <Fade
                    opposite
                    when={isShownTextPrompt}
                    duration={2000}
                    style={{ width: '100%' }}
                  >
                    <div id="prompt-text" style={{ fontSize: '20px' }}>
                      {getPromptContent(promptStep, t)}
                    </div>
                  </Fade>
                </div>
              </Col>
            </Row>
          </Row>
          <Fade
            opposite
            when={isShownTextPrompt}
            duration={500}
            style={{ width: '100%' }}
          >
            <ConnectingIndicator
              currentStep={promptStep}
              connectionIconType={connectionIconType}
              isShownSelectingSharingIcon={isShownSpinnerIcon}
              selectingSharingIconType={spinnerIconType}
            />
          </Fade>
        </div>
      </Slide>
      <div
        style={{
          position: 'absolute',
          zIndex: 1,
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
        }}
      >
        <PlayerControlPanel
          onSwitchChangedCallback={(isEnabled) => setIsWithControls(isEnabled)}
          isDefaultPlayerTurnedOn={isWithControls}
          handleClickFullscreen={() => {
            if (!screenfull.isEnabled) return;
            // @ts-ignore Property 'request' does not exist on type '{ isEnabled: false; }'.
            screenfull.request(findDOMNode(player.current));
            setIsFullScreenOn(!isFullScreenOn);
          }}
          handleClickPlayPause={handlePlayPause}
          isPlaying={playing}
          setVideoQuality={setVideoQuality}
          selectedVideoQuality={videoQuality}
          screenSharingSourceType={screenSharingSourceType}
          toaster={toaster}
        />
        <div
          id="video-container"
          style={{
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div
            id="player-wrapper-id"
            className="player-wrapper"
            style={{
              position: 'relative',
              paddingTop: '56.25%',
            }}
          >
            <ReactPlayer
              ref={player}
              id={REACT_PLAYER_WRAPPER_ID}
              playing={playing}
              playsinline={true}
              controls={isWithControls}
              muted={true}
              url={(url as unknown) as MediaStream}
              width="100%"
              height="100%"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </div>
          <canvas id="comparison-canvas" style={{ display: 'none' }}></canvas>
        </div>
      </div>
      <Toaster ref={refHandlers.toaster} position={Position.TOP_LEFT} />
      <ErrorDialog
        errorMessage={dialogErrorMessage}
        isOpen={isErrorDialogOpen}
      />
    </Grid>
  );
}

export default App;
