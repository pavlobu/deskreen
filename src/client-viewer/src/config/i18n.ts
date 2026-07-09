/* istanbul ignore file */

import { Classes } from '@blueprintjs/core';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

const RTL_LANGUAGES = new Set(['ar']);

const applyDocumentDirection = (language: string): void => {
	if (typeof document === 'undefined') {
		return;
	}
	const isRtl = RTL_LANGUAGES.has(language);
	const direction = isRtl ? 'rtl' : 'ltr';
	document.documentElement.setAttribute('dir', direction);
	document.documentElement.setAttribute('lang', language);
	if (document.body) {
		document.body.classList.toggle(Classes.RTL, isRtl);
		return;
	}
	document.addEventListener(
		'DOMContentLoaded',
		() => {
			document.body?.classList.toggle(Classes.RTL, isRtl);
		},
		{ once: true },
	);
};

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

const initPromise = i18n
	// load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
	// learn more: https://github.com/i18next/i18next-http-backend
	.use(Backend)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		lng: 'en',
		saveMissing: true,
		saveMissingTo: 'all',
		fallbackLng: 'en', // TODO: to generate missing keys use false as value here, will be useful when custom nodejs server is created to store missing values
		debug: false, // change to true to see debug message logs in browser console
		// whitelist: ['en', 'es', 'ru', 'ua', 'zh_CN', 'zh_TW', 'da', 'de', 'fi', 'ko', 'it', 'ja', 'nl', 'fr', 'sv'],
		backend: {
			// path where resources get loaded from
			loadPath: '/locales/{{lng}}/{{ns}}.json',
			// TODO: in future implement custom nodejs server that accepts missing translations POST requests and updates .missing.json files accordingly. Here is how to do so: https://www.robinwieruch.de/react-internationalization . it can be simple nodejs server that can be started when 'yarn dev' is running, need to ckagne package.json file then
			// path to post missing resources
			addPath: '/locales/{{lng}}/{{ns}}.json',
			// jsonIndent to use when storing json files
			jsonIndent: 2,
		},

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	});

initPromise.then(() => {
	applyDocumentDirection(i18n.language);
});

i18n.on('languageChanged', (language) => {
	applyDocumentDirection(language);
});

export default i18n;
