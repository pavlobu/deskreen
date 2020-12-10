import React, { Suspense } from 'react';

import Enzyme, { shallow } from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';
import MainView from '.';
import { I18nextProvider } from 'react-i18next';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Mock react-i18next
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    en: {
      common: {},
    },
  },
  debug: false,
});

Enzyme.configure({ adapter: new Adapter() });
jest.useFakeTimers();

it('should match exact snapshot', () => {
  const subject = shallow(
    <Suspense fallback={<div>loading</div>}>
      <I18nextProvider i18n={i18n}>
        <MainView />
      </I18nextProvider>
    </Suspense>
  );
  expect(subject).toMatchSnapshot();
});
