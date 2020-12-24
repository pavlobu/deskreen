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
import FullScreenEnter from '../../images/fullscreen_24px.svg';
import FullScreenExit from '../../images/fullscreen_exit-24px.svg';
import DeskreenIconPNG from '../../images/deskreen_logo_128x128.png';
import RedHeartTwemojiPNG from '../../images/red_heart_2764_twemoji_120x120.png';
import { Col, Row } from 'react-flexbox-grid';
import screenfull from 'screenfull';
import { VideoQuality } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import handlePlayerToggleFullscreen from './handlePlayerToggleFullscreen';
import initScreenfullOnChange from './initScreenfullOnChange';

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

function PlayerControlPanel(props: PlayerControlPanelProps) {
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

  useEffect(() => {
    initScreenfullOnChange(setIsFullScreenOn);
  }, []);

  const handleClickFullscreenWhenDefaultPlayerIsOn = useCallback(() => {
    handlePlayerToggleFullscreen();
  }, []);

  return (
    <>
      <Card elevation={4}>
        <Row between="xs" middle="xs">
          <Col xs={12} md={3}>
            <Tooltip
              content="Click to visit our website"
              position={Position.BOTTOM}
            >
              <Button minimal>
                <Row middle="xs" style={{ opacity: '0.75' }}>
                  <Col xs={4}>
                    <img
                      src={DeskreenIconPNG}
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
              content="If you like Deskreen, consider donating! Deskreen is free and opensource forever! You can help us to make Deskreen even better!"
              position={Position.BOTTOM}
            >
              <Button style={{ borderRadius: '100px' }}>
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
                      style={{ transform: 'translateY(2px) translateX(-5px)' }}
                    >
                      <Text>Donate!</Text>
                    </div>
                  </Col>
                </Row>
              </Button>
            </Tooltip>
          </Col>
          <Col xs={12} md={6}>
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
                          ? 'Video stream is paused.'
                          : 'Video stream is playing',
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
                        <Text className="bp3-text-large">
                          {isPlaying ? 'Pause' : 'Play'}
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
                  {screenSharingSourceType === 'window' ? (
                    <Tooltip
                      content="You can't change video quality when sharing a window. You can change quality only when shering entire screen."
                      position={Position.BOTTOM}
                    >
                      <Button minimal disabled>
                        <Icon icon="cog" color="#A7B6C2" />
                      </Button>
                    </Tooltip>
                  ) : (
                    <Popover
                      content={
                        <>
                          <H5>Video Quality:</H5>
                          <Divider />
                          {Object.values(VideoQuality).map(
                            (q: VideoQuality) => {
                              return (
                                <Row key={q}>
                                  <Button
                                    minimal
                                    active={selectedVideoQuality === q}
                                    style={videoQualityButtonStyle}
                                    onClick={() => {
                                      setVideoQuality(q);
                                      toaster?.show({
                                        icon: 'clean',
                                        intent: Intent.PRIMARY,
                                        message: `Video quality has been changed to ${q}`,
                                      });
                                    }}
                                  >
                                    {q}
                                  </Button>
                                </Row>
                              );
                            }
                          )}
                        </>
                      }
                      position={Position.BOTTOM}
                      popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                    >
                      <Tooltip
                        content="Video Quality"
                        position={Position.BOTTOM}
                      >
                        <Button minimal>
                          <Icon icon="cog" color="white" />
                        </Button>
                      </Tooltip>
                    </Popover>
                  )}
                  <Divider
                    style={{
                      height: '20px',
                      borderRight: '1px solid #ffffffa8',
                      borderBottom: '1px solid #ffffffa8',
                    }}
                  />
                  <Tooltip
                    content="Enter Full Screen Mode"
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
                      message: `Default video player has been turned ${
                        isDefaultPlayerTurnedOn ? 'OFF' : 'ON'
                      }`,
                    });
                  }}
                  innerLabel={isDefaultPlayerTurnedOn ? 'ON' : 'OFF'}
                  inline
                  label={`Default Video Player`}
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
