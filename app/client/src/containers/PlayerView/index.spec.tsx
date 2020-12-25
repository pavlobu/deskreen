import React from 'react';
import renderer from 'react-test-renderer';
import PlayerView from '.';
import ScreenSharingSource from '../../features/PeerConnection/ScreenSharingSourceEnum';
import { VideoQuality } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';

jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = renderer.create(
    <>
      <PlayerView
        isWithControls={false}
        setIsWithControls={() => {}}
        isFullScreenOn={false}
        setIsFullScreenOn={() => {}}
        handlePlayPause={() => {}}
        isPlaying={false}
        setVideoQuality={() => {}}
        videoQuality={VideoQuality.Q_100_PERCENT}
        screenSharingSourceType={ScreenSharingSource.SCREEN}
        streamUrl={undefined}
      />
    </>
  );
  expect(subject).toMatchSnapshot();
});
