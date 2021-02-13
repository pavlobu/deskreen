/* istanbul ignore file */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ipcRenderer } from 'electron';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import SyncBackend from 'i18next-node-fs-backend';
import { join } from 'path';
import config from './app.lang.config';
import isProduction from '../utils/isProduction';
import translationEN from '../locales/en/translation.json';
import translationES from '../locales/es/translation.json';
import translationKO from '../locales/ko/translation.json';
import translationUA from '../locales/ua/translation.json';
import translationRU from '../locales/ru/translation.json';
import translationZH_CN from '../locales/zh_CN/translation.json';
import translationZH_TW from '../locales/zh_TW/translation.json';
import translationDA from '../locales/da/translation.json';
import translationDE from '../locales/de/translation.json';
import translationFI from '../locales/fi/translation.json';
import translationIT from '../locales/it/translation.json';
import translationJA from '../locales/ja/translation.json';
import translationNL from '../locales/nl/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationSV from '../locales/sv/translation.json';
import { IpcEvents } from '../main/IpcEvents.enum';
import { ElectronStoreKeys } from '../enums/ElectronStoreKeys.enum';
import store from '../deskreen-electron-store';

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
  res.push(translationKO.Hello);
  res.push(translationRU.Hello);
  res.push(translationZH_CN.Hello);
  res.push(translationZH_TW.Hello);
  res.push(translationDA.Hello);
  res.push(translationDE.Hello);
  res.push(translationFI.Hello);
  res.push(translationIT.Hello);
  res.push(translationJA.Hello);
  res.push(translationNL.Hello);
  res.push(translationFR.Hello);
  res.push(translationSV.Hello);

  shuffleArray(res);

  res.unshift(translationEN.Hello);

  return res;
};

async function initI18NextOptions() {
  const appPath = await ipcRenderer.invoke(IpcEvents.GetAppPath);
  const appLanguage = String(store.get(ElectronStoreKeys.AppLanguage));
  i18n.use(SyncBackend);
  i18n.use(initReactI18next);
  const i18nextOptions = {
    debug: true,
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
    lng: config.languages.includes(appLanguage) ? appLanguage : 'en',
    fallbackLng: config.fallbackLng,
    whitelist: config.languages,
    react: {
      wait: false,
    },
  };

  if (!i18n.isInitialized) {
    i18n.init(i18nextOptions);
  }
}
initI18NextOptions();

i18n.on('languageChanged', () => {
  ipcRenderer.send('client-changed-language', i18n.language);
});

export default i18n;
