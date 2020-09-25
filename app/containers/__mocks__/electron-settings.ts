/* eslint-disable import/prefer-default-export */

// export const hasSync = (name: string) => {
//   if (name === 'appLanguage') {
//     return true;
//   }
//   return false;
// };

// export const getSync = (name: string) => {
//   if (name === 'appLanguage') {
//     return 'en';
//   }
//   return 'en';
// };

export default {
  hasSync: (name: string) => {
    if (name === 'appLanguage') {
      return true;
    }
    return true;
  },
  getSync: (name: string) => {
    if (name === 'appLanguage') {
      return 'en';
    }
    return 'en';
  },
};
