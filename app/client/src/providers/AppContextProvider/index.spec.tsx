import React from 'react';
import renderer from 'react-test-renderer';
import { AppContextProvider } from '.';

jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = renderer.create(
    <>
      <AppContextProvider />
    </>
  );
  expect(subject).toMatchSnapshot();
});
