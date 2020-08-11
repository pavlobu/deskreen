import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../store';
import Routes from '../Routes';
import i18n from '../configs/i18next.config.client';

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
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  );
};

export default hot(Root);
