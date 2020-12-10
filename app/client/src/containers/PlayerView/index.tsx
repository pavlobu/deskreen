import { Position, Toaster } from '@blueprintjs/core';
import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import PlayerControlPanel from '../../components/PlayerControlPanel';
import {
  COMPARISON_CANVAS_ID,
  REACT_PLAYER_WRAPPER_ID,
} from '../../constants/appConstants';
import { VideoQuality } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';

interface PlayerViewProps {
  isWithControls: boolean;
  setIsWithControls: (_: boolean) => void;
  isFullScreenOn: boolean;
  setIsFullScreenOn: (_: boolean) => void;
  handlePlayPause: () => void;
  isPlaying: boolean;
  setVideoQuality: (_: VideoQuality) => void;
  videoQuality: VideoQuality;
  screenSharingSourceType: ScreenSharingSourceType;
  streamUrl: undefined | MediaStream;
}

function PlayerView(props: PlayerViewProps) {
  const {
    screenSharingSourceType,
    setIsWithControls,
    isWithControls,
    isFullScreenOn,
    setIsFullScreenOn,
    handlePlayPause,
    isPlaying,
    setVideoQuality,
    videoQuality,
    streamUrl,
  } = props;

  const player = useRef(null);
  const [toaster, setToaster] = useState<undefined | Toaster>();

  const refHandlers = {
    toaster: (ref: Toaster) => {
      setToaster(ref);
    },
  };

  return (
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
          const playerElement = document.querySelector(`#${REACT_PLAYER_WRAPPER_ID}`);
          if (!playerElement) return;
          screenfull.request(playerElement);
          setIsFullScreenOn(!isFullScreenOn);
        }}
        handleClickPlayPause={handlePlayPause}
        isPlaying={isPlaying}
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
            playing={isPlaying}
            playsinline={true}
            controls={isWithControls}
            muted={true}
            url={streamUrl}
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'black',
            }}
          />
        </div>
        <canvas id={COMPARISON_CANVAS_ID} style={{ display: 'none' }}></canvas>
      </div>
      <Toaster ref={refHandlers.toaster} position={Position.TOP_LEFT} />
    </div>
  );
}

export default PlayerView;
