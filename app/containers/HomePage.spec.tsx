import React, { Suspense } from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './HomePage';
import { SettingsProvider } from './SettingsProvider';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

jest.mock('electron', () => {
  return {
    remote: {
      getGlobal: (globalName: string) => {
        if (globalName === 'connectedDevicesService') {
          return {
            getDevices: () => [],
            addPendingConnectedDeviceListener: () => {},
          };
        }
        if (globalName === 'sharingSessionService') {
          return {
            createWaitingForConnectionSharingSession: () =>
              new Promise(() => {}),
            setAppLanguage: () => {},
            setAppTheme: () => {},
          };
        }
        return {};
      },
    },
  };
});

it('should match exact snapshot', () => {
  const subject = mount(
    <>
      <Suspense fallback={<div>Loading... </div>}>
        <SettingsProvider>
          <Router>
            <HomePage />
          </Router>
        </SettingsProvider>
      </Suspense>
    </>
  );
  expect(EnzymeToJson(subject)).toMatchSnapshot();
});
