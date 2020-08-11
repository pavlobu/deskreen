// const i18n = require('i18next');
// const i18nextBackend = require('i18next-fs-backend');
// const { join } = require('path');
// const config = require('./app.config');

import i18n from 'i18next';
import i18nextBackend from 'i18next-node-fs-backend';
import { join } from 'path';
import isDev from 'electron-is-dev';
import config from './app.config';

const i18nextOptions = {
  fallbackLng: config.fallbackLng,
  lng: 'en',
  ns: 'translation',
  defaultNS: 'translation',
  backend: {
    // path where resources get loaded from
    loadPath: isDev
      ? join(__dirname, '../locales/{{lng}}/{{ns}}.json')
      : 'locales/{{lng}}/{{ns}}.json',
    // path to post missing resources
    addPath: isDev
      ? join(__dirname, '../locales/{{lng}}/{{ns}}.missing.json')
      : 'locales/{{lng}}/{{ns}}.json',
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
// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n.init(i18nextOptions);
  // i18n.init({
  //   lng: 'en',
  //   debug: true,
  //   resources: {
  //     en: {
  //       translation: {
  //         Language: 'Jjdjjdjd',
  //       },
  //     },
  //   },
  // });
  console.log('\n\n\n\n INTITIALIZING I18N ----');
}

console.log(i18n.t('Language'));

export default i18n;
