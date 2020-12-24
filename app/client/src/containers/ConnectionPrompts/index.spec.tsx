import React from 'react';
import renderer from 'react-test-renderer';
import ConnectionPrompts from '.';

jest.useFakeTimers();

const TEST_DEVICE_DETAILS = {
  myIP: '',
  myOS: '',
  myDeviceType: '',
  myBrowser: '',
};
describe('when getPromptContent is called', () => {
  it('should match exact snapshot on each step', () => {
    for (let i = 0; i < 4; ++i) {
      const subject = renderer.create(
        <>
          <ConnectionPrompts
            myDeviceDetails={TEST_DEVICE_DETAILS}
            isShownTextPrompt
            promptStep={i}
            connectionIconType="feed"
            isShownSpinnerIcon
            spinnerIconType="application"
            isOpen
          />
        </>
      );
      expect(subject).toMatchSnapshot();
    }
  });
});
