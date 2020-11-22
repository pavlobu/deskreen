import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import IntermediateStep from './IntermediateStep';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

jest.mock('electron', () => {
  return {
    remote: {
      getGlobal: (globalName: string) => {
        if (globalName === 'desktopCapturerSourcesService') {
          return {
            getScreenSources: () => [],
            getAppWindowSources: () => [],
          };
        }
        return {};
      },
    },
  };
});

const confirmButtonSelector = 'button.bp3-button.bp3-intent-success';

function setup(
  activeStep = 0,
  resetDeviceMock = () => {},
  resetUserAllowedMock = () => {}
) {
  const getWrapper = () =>
    mount(
      <>
        <Router>
          <IntermediateStep
            activeStep={activeStep}
            steps={['a', 'b', 'c']}
            handleNext={() => {}}
            handleBack={() => {}}
            handleNextEntireScreen={() => {}}
            handleNextApplicationWindow={() => {}}
            resetPendingConnectionDevice={resetDeviceMock}
            resetUserAllowedConnection={resetUserAllowedMock}
          />
        </Router>
      </>
    );

  const component = getWrapper();

  const buttons = {
    confirmButton: component.find(confirmButtonSelector),
  };

  return {
    component,
    buttons,
  };
}

it('should match exact snapshot on each step', () => {
  for (let testActiveStep = 0; testActiveStep < 3; testActiveStep += 1) {
    const { component } = setup(
      testActiveStep,
      () => {},
      () => {}
    );
    expect(EnzymeToJson(component)).toMatchSnapshot();
  }
});

it('should call resetPendingConnectionDevice when Confirm button clicked on confirm step', async () => {
  const confirmStepNumber = 2;
  const mockResetPendingConnectionDeviceCallback = jest.fn();
  const { buttons } = setup(
    confirmStepNumber,
    mockResetPendingConnectionDeviceCallback,
    () => {}
  );

  buttons.confirmButton.simulate('click');

  setTimeout(() => {
    expect(mockResetPendingConnectionDeviceCallback).toBeCalled();
  }, 500);
});

it('should call resetUserAllowedConnection when Confirm button clicked on confirm step', () => {
  const confirmStepNumber = 2;
  const mockResetUserAllowedConnectionCallback = jest.fn();
  const { buttons } = setup(
    confirmStepNumber,
    () => {},
    mockResetUserAllowedConnectionCallback
  );

  buttons.confirmButton.simulate('click');

  setTimeout(() => {
    expect(mockResetUserAllowedConnectionCallback).toBeCalled();
  }, 500);
});
