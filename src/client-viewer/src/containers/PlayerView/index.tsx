import { useEffect, useRef } from 'react';
import VideoJSPlayer from '../../components/VideoJSPlayer';
import PlayerControlPanel from '../../components/PlayerControlPanel';
import { COMPARISON_CANVAS_ID, PLAYER_WRAPPER_ID } from '../../constants/appConstants';
import { type VideoQualityType } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';
import { togglePlayerFullscreen } from '../../utils/playerFullscreen';

interface PlayerViewProps {
	isWithControls: boolean;
	setIsWithControls: (_: boolean) => void;
	handlePlayPause: () => void;
	isPlaying: boolean;
	setVideoQuality: (_: VideoQualityType) => void;
	videoQuality: VideoQualityType;
	screenSharingSourceType: ScreenSharingSourceType;
	streamUrl: undefined | MediaStream;
	isDarkTheme: boolean;
}

function PlayerView(props: PlayerViewProps) {
  const {
    screenSharingSourceType,
    setIsWithControls,
    isWithControls,
    handlePlayPause,
    isPlaying,
    setVideoQuality,
    videoQuality,
    streamUrl,
    isDarkTheme,
  } = props;

  // const player = useRef(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  // no external player ref needed for video.js variant

  useEffect(() => {
    if (!streamUrl) return;

    // html5 video mode
    if (isWithControls && videoRef.current) {
      if (streamUrl instanceof MediaStream) {
        videoRef.current.srcObject = streamUrl;
      } else {
        videoRef.current.src = streamUrl;
      }
      videoRef.current
        .play()
        .catch((error) => {
          console.error('Error playing video:', error);
        });
      return;
    }

    // video.js mode (default) doesn't need imperative src assignment here
  }, [streamUrl, isWithControls]);

  useEffect(() => {
    if (isWithControls) {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current
          .play()
          .catch((error) => {
            console.error('Error playing video:', error);
          });
      } else {
        videoRef.current.pause();
      }
    }
    // react-player play/pause is handled via its `playing` prop
  }, [isPlaying, isWithControls]);

  // @ts-ignore
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <PlayerControlPanel
        onSwitchChangedCallback={(isEnabled) => setIsWithControls(isEnabled)}
        isDefaultPlayerTurnedOn={isWithControls}
        handleClickFullscreen={() => {
				if (togglePlayerFullscreen() === 'failed') {
					console.warn('Unable to toggle fullscreen');
				}
        }}
        handleClickPlayPause={handlePlayPause}
        isPlaying={isPlaying}
        setVideoQuality={setVideoQuality}
        selectedVideoQuality={videoQuality}
        screenSharingSourceType={screenSharingSourceType}
        isDarkTheme={isDarkTheme}
      />
      <div
        id='video-container'
        style={{
          margin: '0 auto',
          position: 'relative',
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: 0,
          backgroundColor: 'black',
        }}
      >
        <div
          id={PLAYER_WRAPPER_ID}
          className='player-wrapper'
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
          }}
        >
          {isWithControls ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className='absolute top-0 left-0 w-full h-full'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: 'black',
              }}
            />
          ) : (
            <VideoJSPlayer
              stream={streamUrl}
              playing={isPlaying}
              containerEl={document.getElementById(PLAYER_WRAPPER_ID)}
            />
          )}
        </div>
        <canvas id={COMPARISON_CANVAS_ID} style={{ display: 'none' }}></canvas>
      </div>
    </div>
  );
}

export default PlayerView;
