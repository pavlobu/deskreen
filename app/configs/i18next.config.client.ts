/* istanbul ignore file */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { remote, ipcRenderer } from 'electron';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import SyncBackend from 'i18next-node-fs-backend';
import { join } from 'path';
import settings from 'electron-settings';
import config from './app.lang.config';
import isProduction from '../utils/isProduction';

import translationEN from '../locales/en/translation.json';
import translationES from '../locales/es/translation.json';
import translationUA from '../locales/ua/translation.json';
import translationRU from '../locales/ru/translation.json';
import translationZH_CN from '../locales/zh_CN/translation.json';
import translationZH_TW from '../locales/zh_TW/translation.json';
import translationDA from '../locales/da/translation.json';
import translationDE from '../locales/de/translation.json';

export const getLangFullNameToLangISOKeyMap = (): Map<string, string> => {
  const res = new Map<string, string>();
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(
    config.langISOKeyToLangFullNameMap
  )) {
    res.set(value, key);
  }
  return res;
};

export const getLangISOKeyToLangFullNameMap = (): Map<string, string> => {
  const res = new Map<string, string>();
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(
    config.langISOKeyToLangFullNameMap
  )) {
    res.set(key, value);
  }
  return res;
};

function shuffleArray(array: any[]) {
  // eslint-disable-next-line no-plusplus
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const getShuffledArrayOfHello = (): string[] => {
  const res: string[] = [];

  res.push(translationES.Hello);
  res.push(translationUA.Hello);
  res.push(translationRU.Hello);
  res.push(translationZH_CN.Hello);
  res.push(translationZH_TW.Hello);
  res.push(translationDA.Hello);
  res.push(translationDE.Hello);

  shuffleArray(res);

  res.unshift(translationEN.Hello);

  return res;
};

const appPath = remote.getGlobal('appPath');

const i18nextOptions = {
  interpolation: {
    escapeValue: false,
  },
  backend: {
    // path where resources get loaded from
    loadPath: isProduction()
      ? join(appPath, 'locales/{{lng}}/{{ns}}.json')
      : join(__dirname, './locales/{{lng}}/{{ns}}.json'),
    // path to post missing resources
    addPath: isProduction()
      ? join(appPath, 'locales/{{lng}}/{{ns}}.json')
      : join(__dirname, './locales/{{lng}}/{{ns}}.missing.json'),
    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },
  saveMissing: true,
  lng: (settings.hasSync('appLanguage')
    ? settings.getSync('appLanguage')
    : 'en') as string,
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

i18n.on('languageChanged', () => {
  ipcRenderer.send('client-changed-language', i18n.language);
});

export default i18n;
