/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import settings from 'electron-settings';
import { Classes } from '@blueprintjs/core';

// TODO: move to 'constants' tsx file ?
export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';
export const DARK_UI_BACKGROUND = '#293742';

interface SettingsContextInterface {
  isDarkTheme: boolean;
  currentLanguage: string;
  setIsDarkThemeHook: (val: boolean) => void;
  setCurrentLanguageHook: (newLang: string) => void;
}

const defaultSettingsContextValue = {
  isDarkTheme: false,
  setIsDarkThemeHook: () => {},
  setCurrentLanguageHook: () => {},
  currentLanguage: 'en',
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
  defaultSettingsContextValue
);

export const SettingsProvider: React.FC = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const loadDarkThemeFromSettings = () => {
    const gotIsDarkThemeFromSettings = settings.hasSync('appIsDarkTheme')
      ? settings.getSync('appIsDarkTheme') === 'true'
      : false;

    if (gotIsDarkThemeFromSettings) {
      document.body.classList.toggle(Classes.DARK);
      document.body.style.backgroundColor = LIGHT_UI_BACKGROUND;
    }

    setIsDarkTheme(gotIsDarkThemeFromSettings);
  };

  useEffect(() => {
    loadDarkThemeFromSettings();
  }, []);

  const setIsDarkThemeHook = (val: boolean) => {
    settings.setSync('appIsDarkTheme', `${val}`);
    setIsDarkTheme(val);
  };

  const setCurrentLanguageHook = (newLang: string) => {
    setCurrentLanguage(newLang);
  };

  const value = {
    isDarkTheme,
    setIsDarkThemeHook,
    currentLanguage,
    setCurrentLanguageHook,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
