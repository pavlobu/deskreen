import React from 'react';

export interface SettingsContextInterface {
  currentLanguage: string;
  setCurrentLanguageHook: (newLang: string) => void;
}

export const defaultSettingsContextValue = {
  setCurrentLanguageHook: () => {},
  currentLanguage: 'en',
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
  defaultSettingsContextValue,
);
