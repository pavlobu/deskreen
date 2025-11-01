import i18next, { TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import config from '../../../common/app.lang.config';
import translationEN from '../../../common/locales/en/translation.json';
import translationES from '../../../common/locales/es/translation.json';
import translationKO from '../../../common/locales/ko/translation.json';
import translationUA from '../../../common/locales/ua/translation.json';
import translationRU from '../../../common/locales/ru/translation.json';
import translationZH_CN from '../../../common/locales/zh_CN/translation.json';
import translationZH_TW from '../../../common/locales/zh_TW/translation.json';
import translationDA from '../../../common/locales/da/translation.json';
import translationDE from '../../../common/locales/de/translation.json';
import translationFI from '../../../common/locales/fi/translation.json';
import translationIT from '../../../common/locales/it/translation.json';
import translationJA from '../../../common/locales/ja/translation.json';
import translationNL from '../../../common/locales/nl/translation.json';
import translationFR from '../../../common/locales/fr/translation.json';
import translationSV from '../../../common/locales/sv/translation.json';
import { IpcEvents } from '../../../common/IpcEvents.enum';
// import { store } from '../../../common/deskreen-electron-store';
// import { ElectronStoreKeys } from '../../../common/ElectronStoreKeys.enum';

const i18n = i18next.createInstance(); // Create a new instance

export const getLangFullNameToLangISOKeyMap = (): Map<string, string> => {
  const res = new Map<string, string>();

  for (const [key, value] of Object.entries(config.langISOKeyToLangFullNameMap)) {
    res.set(value, key);
  }
  return res;
};

export const getLangISOKeyToLangFullNameMap = (): Map<string, string> => {
  const res = new Map<string, string>();

  for (const [key, value] of Object.entries(config.langISOKeyToLangFullNameMap)) {
    res.set(key, value);
  }
  return res;
};

function shuffleArray(array: unknown[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export let t: TFunction;

export const getShuffledArrayOfHello = (): string[] => {
  const res: string[] = [];

  res.push(translationES.hello);
  res.push(translationUA.hello);
  res.push(translationKO.hello);
  res.push(translationRU.hello);
  res.push(translationZH_CN.hello);
  res.push(translationZH_TW.hello);
  res.push(translationDA.hello);
  res.push(translationDE.hello);
  res.push(translationFI.hello);
  res.push(translationIT.hello);
  res.push(translationJA.hello);
  res.push(translationNL.hello);
  res.push(translationFR.hello);
  res.push(translationSV.hello);

  shuffleArray(res);

  res.unshift(translationEN.hello);

  return res;
};

async function initI18NextOptions(): Promise<void> {
  const appLanguage = await window.electron.ipcRenderer.invoke(IpcEvents.GetAppLanguage);

  i18n.use(initReactI18next);
  const i18nextOptions = {
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    lng: config.languages.includes(appLanguage) ? appLanguage : 'en',
    fallbackLng: config.fallbackLng,
    whitelist: config.languages,
    react: {},
    resources: {
      en: {
        translation: translationEN,
      },
      es: {
        translation: translationES,
      },
      ko: {
        translation: translationKO,
      },
      ua: {
        translation: translationUA,
      },
      ru: {
        translation: translationRU,
      },
      zh_CN: {
        translation: translationZH_CN,
      },
      zh_TW: {
        translation: translationZH_TW,
      },
      da: {
        translation: translationDA,
      },
      de: {
        translation: translationDE,
      },
      fi: {
        translation: translationFI,
      },
      it: {
        translation: translationIT,
      },
      ja: {
        translation: translationJA,
      },
      nl: {
        translation: translationNL,
      },
      fr: {
        translation: translationFR,
      },
      sv: {
        translation: translationSV,
      },
    },
  };

  if (!i18n.isInitialized) {
    t = await i18n.init(i18nextOptions);
  }
}
initI18NextOptions();

i18n.on('languageChanged', () => {
  window.electron.ipcRenderer.send('client-changed-language', i18n.language);
});

export default i18n;
