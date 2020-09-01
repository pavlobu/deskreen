/* eslint-disable import/prefer-default-export */

export const remote = {
  getGlobal: (name: string) => {
    if (name === 'appPath') {
      return __dirname;
    }
    return '';
  },
};
