/* istanbul ignore file */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    // fallbackLng: 'ua',
    lng: 'en',
    saveMissing: true,
    saveMissingTo: 'all',
    fallbackLng: 'en', // TODO: to generate missing keys use false as value here, will be useful when custom nodejs server is created to store missing values
    debug: false, // change to true to see debug message logs in browser console
    whitelist: ['en', 'es', 'ru', 'ua', 'zh_CN', 'zh_TW', 'da', 'de'],

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

export default i18n;
