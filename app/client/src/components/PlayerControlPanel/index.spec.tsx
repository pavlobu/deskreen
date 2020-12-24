import React from 'react';
import renderer from 'react-test-renderer';
import PlayerControlPanel from '.';
import { VideoQuality } from '../../features/VideoAutoQualityOptimizer/VideoQualityEnum';

jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = renderer.create(
    <>
      <PlayerControlPanel
        onSwitchChangedCallback={() => {}}
        isPlaying
        isDefaultPlayerTurnedOn
        handleClickFullscreen={() => {}}
        handleClickPlayPause={() => {}}
        setVideoQuality={() => {}}
        selectedVideoQuality={VideoQuality.Q_100_PERCENT}
        screenSharingSourceType={'screen'}
        toaster={undefined}
      />
    </>
  );
  expect(subject).toMatchSnapshot();
});
