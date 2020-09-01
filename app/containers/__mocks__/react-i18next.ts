/* eslint-disable import/prefer-default-export */

import { ThirdPartyModule } from 'i18next';

export const useTranslation = () => {
  return {
    t: (key: string) => {
      if (key === 'Language') {
        return 'Language';
      }
      return '';
    },
  };
};

export const initReactI18next: ThirdPartyModule = {
  type: '3rdParty',
  init: () => {},
};
