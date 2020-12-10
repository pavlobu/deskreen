import React from 'react';
import renderer from 'react-test-renderer';
import PlayerView from '.';
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
        screenSharingSourceType={'screen'}
        streamUrl={undefined}
      />
    </>
  );
  expect(subject).toMatchSnapshot();
});
