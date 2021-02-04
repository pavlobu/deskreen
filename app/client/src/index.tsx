import './polyfills';
import React, { Suspense } from 'react';
import './config/i18n';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { AppContextProvider } from './providers/AppContextProvider';

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <Suspense fallback="loading">
        <App />
      </Suspense>
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
