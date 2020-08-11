import React, { Fragment, Suspense } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
// import { ipcRenderer } from 'electron';
// import { I18nextProvider } from 'react-i18next';
// import i18n from './configs/i18next.config.client';
import './configs/i18next.config.client';
import { history, configuredStore } from './store';
import './app.global.css';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

// let initialI18nStore = ipcRenderer.sendSync('get-initial-translations');

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  render(
    <AppContainer>
      <Suspense fallback="loading">
        <Root store={store} history={history} />
      </Suspense>
    </AppContainer>,
    document.getElementById('root')
  );
});
