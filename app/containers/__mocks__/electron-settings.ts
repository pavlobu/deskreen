export default {
  hasSync: (name: string) => {
    if (name === 'appLanguage') {
      return true;
    }
    return false;
  },
  getSync: (name: string) => {
    if (name === 'appLanguage') {
      return 'en';
    }
    return '';
  },
};
