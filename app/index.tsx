/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-new */
import React, { Fragment, Suspense } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import './configs/i18next.config.client';
import { history, configuredStore } from './store';
import './app.global.css';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  if (process.platform === 'darwin') {
    const windowTopBar = document.createElement('div');
    windowTopBar.style.width = '100%';
    windowTopBar.style.height = '50px';
    windowTopBar.style.position = 'absolute';
    windowTopBar.style.top = '0';
    windowTopBar.style.left = '0';
    // @ts-ignore: all good here
    windowTopBar.style.webkitAppRegion = 'drag';
    windowTopBar.style.pointerEvents = 'none';
    document.body.appendChild(windowTopBar);
  }

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
