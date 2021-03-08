/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  getLangFullNameToLangISOKeyMap,
  getLangISOKeyToLangFullNameMap,
} from './i18next.config.client';

jest.useFakeTimers();

describe('i18next.config.client tests', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when getLangFullNameToLangISOKeyMap called', () => {
    it('should return proper key map', () => {
      // TODO: add more languages here manually when adding new languages in app!
      const expectedMap = new Map();
      expectedMap.set('English', 'en');
      expectedMap.set('Español', 'es');
      expectedMap.set('Русский', 'ru');
      expectedMap.set('Українська', 'ua');
      expectedMap.set('简体中文', 'zh_CN');
      expectedMap.set('繁體中文', 'zh_TW');
      expectedMap.set('Dansk', 'da');
      expectedMap.set('Deutsch', 'de');

      const res = getLangFullNameToLangISOKeyMap();

      expect(res).toEqual(expectedMap);
    });
  });

  describe('when getLangISOKeyToLangFullNameMap called', () => {
    it('should return proper key map', () => {
      // TODO: add more languages here manually when adding new languages in app!
      const expectedMap = new Map();
      expectedMap.set('en', 'English');
      expectedMap.set('es', 'Español');
      expectedMap.set('ru', 'Русский');
      expectedMap.set('ua', 'Українська');
      expectedMap.set('zh_CN', '简体中文');
      expectedMap.set('zh_TW', '繁體中文');
      expectedMap.set('da', 'Dansk');
      expectedMap.set('de', 'Deutsch');

      const res = getLangISOKeyToLangFullNameMap();

      expect(res).toEqual(expectedMap);
    });
  });
});
