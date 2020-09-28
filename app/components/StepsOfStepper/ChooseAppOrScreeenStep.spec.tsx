import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import ChooseAppOrScreeenStep from './ChooseAppOrScreeenStep';

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

it('should match exact snapshot', () => {
  const subject = mount(
    <>
      <Router>
        <ChooseAppOrScreeenStep
          handleNextEntireScreen={() => {}}
          handleNextApplicationWindow={() => {}}
        />
      </Router>
    </>
  );
  expect(EnzymeToJson(subject)).toMatchSnapshot();
});
