/* eslint-disable react/jsx-boolean-value */
import React, { Suspense } from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import SettingsOverlay from './SettingsOverlay';
import { SettingsProvider } from '../../containers/SettingsProvider';
import { ConnectedDevicesProvider } from '../../containers/ConnectedDevicesProvider';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = mount(
    <>
      <Suspense fallback={<div>Loading... </div>}>
        <SettingsProvider>
          <ConnectedDevicesProvider>
            <Router>
              <SettingsOverlay isSettingsOpen={true} handleClose={() => {}} />
            </Router>
          </ConnectedDevicesProvider>
        </SettingsProvider>
      </Suspense>
    </>
  );
  expect(EnzymeToJson(subject)).toMatchSnapshot();
});
