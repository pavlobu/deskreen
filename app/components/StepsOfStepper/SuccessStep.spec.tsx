import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import SuccessStep from './SuccessStep';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

const connectNewDeviceButtonSelector = 'button.bp3-button.bp3-intent-primary';

function setup(handleResetMock = () => {}) {
  const getWrapper = () =>
    mount(
      <>
        <Router>
          <SuccessStep handleReset={handleResetMock} />
        </Router>
      </>
    );

  const component = getWrapper();

  const buttons = {
    connectNewDeviceButton: component.find(connectNewDeviceButtonSelector),
  };

  return {
    component,
    buttons,
  };
}

it('should match exact snapshot', () => {
  const { component } = setup();
  expect(EnzymeToJson(component)).toMatchSnapshot();
});

describe('when "Connect New Device" button is clicked', () => {
  it('should call handleReset injected functional property', () => {
    const mockHandleResetCallback = jest.fn();
    const { buttons } = setup(mockHandleResetCallback);

    buttons.connectNewDeviceButton.simulate('click');

    expect(mockHandleResetCallback).toBeCalled();
  });
});
