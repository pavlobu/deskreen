/* istanbul ignore file */

import i18n from 'i18next';
import i18nextBackend from 'i18next-node-fs-backend';
import { join } from 'path';
import config from './app.lang.config';
import isProduction from '../utils/isProduction';
import store from '../deskreen-electron-store';
import { ElectronStoreKeys } from '../enums/ElectronStoreKeys.enum';

const i18nextOptions = {
  fallbackLng: config.fallbackLng,
  lng: store.has(ElectronStoreKeys.AppLanguage)
    ? String(store.get(ElectronStoreKeys.AppLanguage))
    : 'en',
  ns: 'translation',
  defaultNS: 'translation',
  backend: {
    // path where resources get loaded from
    loadPath: isProduction()
      ? join(__dirname, 'locales/{{lng}}/{{ns}}.json')
      : join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    // path to post missing resources
    addPath: isProduction()
      ? join(__dirname, 'locales/{{lng}}/{{ns}}.json')
      : join(__dirname, '../locales/{{lng}}/{{ns}}.missing.json'),
    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  whitelist: config.languages,
  react: {
    wait: false,
  },
};
i18n.use(i18nextBackend);

if (!i18n.isInitialized) {
  i18n.init(i18nextOptions);
}

export default i18n;
