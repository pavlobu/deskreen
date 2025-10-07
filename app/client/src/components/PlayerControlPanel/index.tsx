/* istanbul ignore file */

// IMPORTANT! leave upper blank line so this file is ignored for coverage!!! More on this issue here
// https://github.com/facebook/create-react-app/issues/6106#issuecomment-550076629
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alignment,
  Button,
  Card,
  H5,
  Switch,
  Divider,
  Text,
  Icon,
  Tooltip,
  Position,
  Popover,
  Classes,
  Toaster,
  Intent,
} from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import FullScreenEnter from '../../images/fullscreen_24px.svg';
import FullScreenExit from '../../images/fullscreen_exit-24px.svg';
import RedHeartTwemojiPNG from '../../images/red_heart_2764_twemoji_120x120.png';
import { Col, Row } from 'react-flexbox-grid';
import screenfull from 'screenfull';
import { VideoQuality } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import handlePlayerToggleFullscreen from './handlePlayerToggleFullscreen';
import initScreenfullOnChange from './initScreenfullOnChange';
import ScreenSharingSource from '../../features/PeerConnection/ScreenSharingSourceEnum';
import { REACT_PLAYER_WRAPPER_ID } from '../../constants/appConstants';
import './index.css'


const videoQualityButtonStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'center',
};

interface PlayerControlPanelProps {
  onSwitchChangedCallback: (isEnabled: boolean) => void;
  isPlaying: boolean;
  isDefaultPlayerTurnedOn: boolean;
  handleClickFullscreen: () => void;
  handleClickPlayPause: () => void;
  setVideoQuality: (q: VideoQuality) => void;
  selectedVideoQuality: VideoQuality;
  screenSharingSourceType: ScreenSharingSourceType;
  toaster: undefined | Toaster;
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function PlayerControlPanel(props: PlayerControlPanelProps) {
  const { t } = useTranslation();
  const {
    isPlaying,
    onSwitchChangedCallback,
    isDefaultPlayerTurnedOn,
    handleClickPlayPause,
    handleClickFullscreen,
    selectedVideoQuality,
    setVideoQuality,
    screenSharingSourceType,
    toaster,
  } = props;

  const isFullScreenAPIAvailable = useMemo(() => screenfull.isEnabled, []);

  const [isFullScreenOn, setIsFullScreenOn] = useState(false);
  const [isVideoFlipped, setIsVideoFlipped] = useState(false);

  useEffect(() => {
    initScreenfullOnChange(setIsFullScreenOn);
  }, []);

  const handleClickFullscreenWhenDefaultPlayerIsOn = useCallback(() => {
    handlePlayerToggleFullscreen();
  }, []);

  const toggleFlipVideo = useCallback(() => {
    const videoElement = isSafari
      ? document.querySelector(`#${REACT_PLAYER_WRAPPER_ID}`)
      : document.querySelector(`#${REACT_PLAYER_WRAPPER_ID} > video`);
    if (isVideoFlipped) {
      // @ts-ignore
      videoElement.style.transform = '';
      setIsVideoFlipped(false);
    } else {
      // @ts-ignore
      videoElement.style.transform = 'rotateY(180deg)';
      setIsVideoFlipped(true);
    }

    toaster?.show({
      icon: 'clean',
      intent: Intent.PRIMARY,
      message: t('Video is flipped horizontally'),
    });
  }, [isVideoFlipped, toaster, t]);

  return (
    <>
      <Card elevation={4}>
        <Row between="xs" middle="xs">
          <Col xs={12} md={3}>
            <Tooltip
              content={t('Click to visit our website')}
              position={Position.BOTTOM}
            >
              <Button
                minimal
                onClick={() => {
                  window.open('https://www.deskreen.com', '_blank');
                }}
              >
                <Row middle="xs" style={{ opacity: '0.75' }}>
                  <Col xs={4}>
                    <img
                      src={window.location.origin + '/logo192.png'}
                      width={42}
                      height={42}
                      alt="logo"
                    />
                  </Col>
                  <Col xs={8}>
                    <H5 style={{ marginBottom: '0px' }}>Deskreen</H5>
                  </Col>
                </Row>
              </Button>
            </Tooltip>
            <Tooltip
              content={t(
                'If you like Deskreen consider contributing financially Deskreen is open-source Your donations keep us motivated to make Deskreen even better'
              )}
              position={Position.BOTTOM}
            >
              <Button
                style={{ borderRadius: '100px' }}
                onClick={() => {
                  window.open('https://www.patreon.com/deskreen', '_blank');
                }}
              >
                <Row start="xs">
                  <Col xs>
                    <img
                      src={RedHeartTwemojiPNG}
                      width={16}
                      height={16}
                      style={{ transform: 'translateY(2px)' }}
                      alt="heart"
                    />
                  </Col>
                  <Col xs>
                    <div
                      style={{
                        transform: 'translateY(2px) translateX(-5px)',
                        width: 'max-content',
                      }}
                    >
                      <Text>{t('Donate')}</Text>
                    </div>
                  </Col>
                </Row>
              </Button>
            </Tooltip>
          </Col>
          <Col xs={12} md={5}>
            <Row center="xs" style={{ height: '42px' }}>
              <Row
                center="xs"
                middle="xs"
                style={{
                  borderRadius: '20px',
                  backgroundColor: '#137CBD',
                  width: '190px',
                  height: '100%',
                }}
              >
                <Row style={{ width: '100%' }} middle="xs" center="xs">
                  <Button
                    minimal
                    onClick={() => {
                      handleClickPlayPause();
                      toaster?.show({
                        icon: isPlaying ? 'pause' : 'play',
                        intent: Intent.PRIMARY,
                        message: isPlaying
                          ? t('Video stream is paused')
                          : t('Video stream is playing'),
                      });
                    }}
                    style={{
                      width: '85px',
                      minWidth: '70px',
                      color: 'white',
                    }}
                  >
                    <Row>
                      <Col xs>
                        <Icon
                          icon={isPlaying ? 'pause' : 'play'}
                          color="white"
                        />
                      </Col>
                      <Col xs>
                        { /* @ts-ignore */ }
                        <Text className="bp3-text-large play-pause-text">
                          {isPlaying ? t('Pause') : t('Play')}
                        </Text>
                      </Col>
                    </Row>
                  </Button>
                  <Divider
                    style={{
                      height: '20px',
                      borderRight: '1px solid #ffffffa8',
                      borderBottom: '1px solid #ffffffa8',
                    }}
                  />
                  <Popover
                    content={
                      <>
                        <H5>{`${t('Video Settings')}:`}</H5>
                        <Divider />
                        <Row>
                          <Button
                            icon="key-tab"
                            minimal
                            active={isVideoFlipped}
                            style={videoQualityButtonStyle}
                            onClick={toggleFlipVideo}
                          >
                            {t('Flip')}
                          </Button>
                        </Row>
                        <Divider />
                        {Object.values(VideoQuality).map((q: VideoQuality) => {
                          return (
                            <Row key={q}>
                              <Button
                                minimal
                                active={selectedVideoQuality === q}
                                style={videoQualityButtonStyle}
                                disabled={
                                  screenSharingSourceType ===
                                  ScreenSharingSource.WINDOW
                                }
                                onClick={() => {
                                  setVideoQuality(q);
                                  toaster?.show({
                                    icon: 'clean',
                                    intent: Intent.PRIMARY,
                                    message: `${t(
                                      'Video quality has been changed to'
                                    )} ${q}`,
                                  });
                                }}
                              >
                                {q}
                              </Button>
                            </Row>
                          );
                        })}
                      </>
                    }
                    position={Position.BOTTOM}
                    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                  >
                    <Tooltip
                      content={t('Click to Open Video Settings')}
                      position={Position.BOTTOM}
                    >
                      <Button minimal>
                        <Icon icon="cog" color="white" />
                      </Button>
                    </Tooltip>
                  </Popover>

                  <Divider
                    style={{
                      height: '20px',
                      borderRight: '1px solid #ffffffa8',
                      borderBottom: '1px solid #ffffffa8',
                    }}
                  />
                  <Tooltip
                    content={t('Click to Enter Full Screen Mode')}
                    position={Position.BOTTOM}
                  >
                    <Button
                      minimal
                      onClick={() => {
                        if (isDefaultPlayerTurnedOn) {
                          handleClickFullscreenWhenDefaultPlayerIsOn();
                        } else {
                          handleClickFullscreen();
                        }
                      }}
                    >
                      <img
                        src={isFullScreenOn ? FullScreenExit : FullScreenEnter}
                        width={16}
                        height={16}
                        style={{
                          transform: 'scale(1.5) translateY(1px)',
                          filter:
                            'invert(100%) sepia(100%) saturate(0%) hue-rotate(127deg) brightness(107%) contrast(102%)',
                        }}
                        alt="fullscreen-toggle"
                      />
                    </Button>
                  </Tooltip>
                </Row>
              </Row>
            </Row>
          </Col>
          <Col xs={12} md={3}>
            <Row end="xs">
              <Col xs={12}>
                <Switch
                  onChange={() => {
                    onSwitchChangedCallback(!isDefaultPlayerTurnedOn);
                    toaster?.show({
                      icon: 'video',
                      intent: Intent.PRIMARY,
                      message: `${
                        isDefaultPlayerTurnedOn
                          ? t('Default video player has been turned OFF')
                          : t('Default video player has been turned ON')
                      }`,
                    });
                  }}
                  innerLabel={isDefaultPlayerTurnedOn ? t('ON') : t('OFF')}
                  inline
                  label={t('Default Video Player')}
                  alignIndicator={Alignment.RIGHT}
                  checked={isDefaultPlayerTurnedOn}
                  disabled={!isFullScreenAPIAvailable}
                  style={{
                    marginBottom: '0px',
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default PlayerControlPanel;
