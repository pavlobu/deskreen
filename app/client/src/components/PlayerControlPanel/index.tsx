import React, { useContext, useMemo, useState } from 'react';
import { Alignment, Button, Card, H5, Switch } from '@blueprintjs/core';
import FullScreenEnter from '../../images/fullscreen_24px.svg';
import FullScreenExit from '../../images/fullscreen_exit-24px.svg';
import { Col, Row } from 'react-flexbox-grid';
import { AppContext } from '../../providers/AppContextProvider';
import {
  DARK_UI_PLAYER_CONTROL_BUTTONS_COLOR,
  LIGHT_UI_PLAYER_CONTROL_BUTTONS_COLOR,
} from '../../constants/styleConstants';
import screenfull from 'screenfull';

// light theme player button icon color:
// filter: invert(44%) sepia(42%) saturate(211%) hue-rotate(164deg) brightness(89%) contrast(94%);

// DARK theme player button icon color:
// filter: 'invert(93%) sepia(2%) saturate(5711%) hue-rotate(178deg) brightness(86%) contrast(72%)'

{
  /* <Row between="xs">
  <Col xs={2} />
  <Col xs={2} />
  <Col xs={2} />
</Row> */
}

interface PlayerControlPanelProps {
  onSwitchChangedCallback: (isEnabled: boolean) => void;
  isFullScreenOn: boolean;
  isPlaying: boolean;
  isDefaultPlayerTurnedOn: boolean;
  handleClickFullscreen: () => void;
  handleClickPlayPause: () => void;
}

function PlayerControlPanel(props: PlayerControlPanelProps) {
  const { isDarkTheme } = useContext(AppContext);

  const {
    isPlaying,
    isFullScreenOn,
    onSwitchChangedCallback,
    isDefaultPlayerTurnedOn,
    handleClickPlayPause,
    handleClickFullscreen,
  } = props;

  const isFullScreenAPIAvailable = useMemo(() => screenfull.isEnabled, []);

  return (
    <>
      <Card elevation={4}>
        <Row between="xs">
          <Col xs={1}>
            <Button
              icon={isPlaying ? 'pause' : 'play'}
              minimal
              onClick={handleClickPlayPause}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </Col>
          <Col xs={3}>
            <H5>Deskreen</H5>
          </Col>
          <Col xs={4}>
            <Row end="xs">
              <Col xs={12}>
                <Switch
                  onChange={() => {
                    onSwitchChangedCallback(!isDefaultPlayerTurnedOn);
                  }}
                  innerLabel={isDefaultPlayerTurnedOn ? 'ON' : 'OFF'}
                  inline
                  label={`Default Video Player is`}
                  alignIndicator={Alignment.RIGHT}
                  checked={isDefaultPlayerTurnedOn}
                  disabled={!isFullScreenAPIAvailable}
                />
                <Button icon="cog" minimal />
                <Button minimal onClick={handleClickFullscreen}>
                  <img
                    src={isFullScreenOn ? FullScreenEnter : FullScreenExit}
                    width={16}
                    height={16}
                    style={{
                      transform: 'scale(1.5)',
                      filter: isDarkTheme
                        ? DARK_UI_PLAYER_CONTROL_BUTTONS_COLOR
                        : LIGHT_UI_PLAYER_CONTROL_BUTTONS_COLOR,
                    }}
                  />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default PlayerControlPanel;
