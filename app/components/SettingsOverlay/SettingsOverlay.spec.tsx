import React, { Suspense } from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import SettingsOverlay from './SettingsOverlay';
import { SettingsProvider } from '../../containers/SettingsProvider';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = mount(
    <>
      <Suspense fallback={<div>Loading... </div>}>
        <SettingsProvider>
          <Router>
            <SettingsOverlay isSettingsOpen handleClose={() => {}} />
          </Router>
        </SettingsProvider>
      </Suspense>
    </>
  );
  expect(EnzymeToJson(subject)).toMatchSnapshot();
});
