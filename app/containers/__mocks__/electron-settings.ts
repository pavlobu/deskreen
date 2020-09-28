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
