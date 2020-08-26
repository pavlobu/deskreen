import { remote, ipcRenderer } from 'electron';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import SyncBackend from 'i18next-node-fs-backend';
import { join } from 'path';
// import isDev from 'electron-is-dev';
import config from './app.config';

let isDev;
try {
  // eslint-disable-next-line global-require
  isDev = require('electron-is-dev');
} catch (e) {
  isDev = true;
}

const appPath = remote.getGlobal('appPath');

const i18nextOptions = {
  interpolation: {
    escapeValue: false,
  },
  backend: {
    // path where resources get loaded from
    loadPath: isDev
      ? join(__dirname, './locales/{{lng}}/{{ns}}.json')
      : join(appPath, 'locales/{{lng}}/{{ns}}.json'),
    // path to post missing resources
    addPath: isDev
      ? join(__dirname, './locales/{{lng}}/{{ns}}.missing.json')
      : join(appPath, 'locales/{{lng}}/{{ns}}.json'),
    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },
  saveMissing: true,
  lng: 'en',
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false,
  },
};
i18n.use(SyncBackend);
i18n.use(initReactI18next);

if (!i18n.isInitialized) {
  i18n.init(i18nextOptions);
}

ipcRenderer.on('sending-language-from-main', (_, message) => {
  i18n.changeLanguage(`${message}`);
});

export default i18n;
