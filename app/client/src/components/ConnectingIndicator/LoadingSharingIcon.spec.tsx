import React from 'react';
import renderer from 'react-test-renderer';
import LoadingSharingIcon from './LoadingSharingIcon';

jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = renderer.create(
    <>
      <LoadingSharingIcon
        loadingSharingIconType="desktop"
        isShownLoadingSharingIcon
      />
    </>
  );

  expect(subject).toMatchSnapshot();
});
