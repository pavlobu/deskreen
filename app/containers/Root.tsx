import React, { useEffect, useState } from 'react';
import { FocusStyleManager } from '@blueprintjs/core';
import { Provider } from 'react-redux';

import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../store';
import Routes from '../Routes';
import i18n from '../configs/i18next.config.client';
import { SettingsProvider } from './SettingsProvider';

FocusStyleManager.onlyShowFocusOnTabs();

type Props = {
  store: Store;
  history: History;
};

const Root = ({ store, history }: Props) => {
  const [, setAppLanguage] = useState('');

  useEffect(() => {
    i18n.on('languageChanged', (lng) => {
      setAppLanguage(lng);
    });
  }, []);

  return (
    <Provider store={store}>
      <SettingsProvider>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </SettingsProvider>
    </Provider>
  );
};

export default hot(Root);
