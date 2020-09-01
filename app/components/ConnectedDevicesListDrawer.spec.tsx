import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import ConnectedDevicesListDrawer from './ConnectedDevicesListDrawer';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = mount(
    <>
      <Router>
        <ConnectedDevicesListDrawer
          isOpen
          handleToggle={() => {}}
          stepperRef={null}
        />
      </Router>
    </>
  );
  expect(EnzymeToJson(subject)).toMatchSnapshot();
});
