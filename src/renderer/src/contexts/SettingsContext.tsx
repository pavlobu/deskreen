import React from 'react';

export interface SettingsContextInterface {
  isDarkTheme: boolean;
  currentLanguage: string;
  setIsDarkThemeHook: (val: boolean) => void;
  setCurrentLanguageHook: (newLang: string) => void;
}

export const defaultSettingsContextValue = {
  isDarkTheme: false,
  setIsDarkThemeHook: () => {},
  setCurrentLanguageHook: () => {},
  currentLanguage: 'en',
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
  defaultSettingsContextValue,
);
