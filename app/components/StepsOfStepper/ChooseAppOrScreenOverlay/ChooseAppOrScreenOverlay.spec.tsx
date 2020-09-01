import React from 'react';
import Enzyme, { mount } from 'enzyme';
import EnzymeToJson from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import ChooseAppOrScreenOverlay from './ChooseAppOrScreenOverlay';

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = mount(
    <>
      <Router>
        <ChooseAppOrScreenOverlay
          isEntireScreenToShareChosen
          isChooseAppOrScreenOverlayOpen
          handleNextEntireScreen={() => {}}
          handleNextApplicationWindow={() => {}}
          handleClose={() => {}}
        />
      </Router>
    </>
  );
  expect(EnzymeToJson(subject)).toMatchSnapshot();
});
