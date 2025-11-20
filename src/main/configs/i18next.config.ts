import i18n from 'i18next';
import config from '../../common/app.lang.config';
// import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
// import { store } from '../../common/deskreen-electron-store';

import translationEN from '../../common/locales/en/translation.json';
import translationES from '../../common/locales/es/translation.json';
import translationKO from '../../common/locales/ko/translation.json';
import translationUA from '../../common/locales/ua/translation.json';
import translationRU from '../../common/locales/ru/translation.json';
import translationZH_CN from '../../common/locales/zh_CN/translation.json';
import translationZH_TW from '../../common/locales/zh_TW/translation.json';
import translationDA from '../../common/locales/da/translation.json';
import translationDE from '../../common/locales/de/translation.json';
import translationFI from '../../common/locales/fi/translation.json';
import translationIT from '../../common/locales/it/translation.json';
import translationJA from '../../common/locales/ja/translation.json';
import translationNL from '../../common/locales/nl/translation.json';
import translationFR from '../../common/locales/fr/translation.json';
import translationSV from '../../common/locales/sv/translation.json';
import { store } from '../../common/deskreen-electron-store';
import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';

const i18nextOptions = {
	fallbackLng: config.fallbackLng,
	lng: store.has(ElectronStoreKeys.AppLanguage)
		? String(store.get(ElectronStoreKeys.AppLanguage))
		: 'en',
	// lng: 'ua',
	ns: 'translation',
	defaultNS: 'translation',
	interpolation: {
		escapeValue: false,
	},
	saveMissing: true,
	whitelist: config.languages,
	react: {
		// wait: false,
	},
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
	i18n.init(i18nextOptions);
}

export default i18n;
