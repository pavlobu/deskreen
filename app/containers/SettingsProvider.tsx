/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Classes } from '@blueprintjs/core';
import { ipcRenderer } from 'electron';
import { IpcEvents } from '../main/IpcEvents.enum';

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

  const loadDarkThemeFromSettings = async () => {
    const isDarkAppTheme = await ipcRenderer.invoke(
      IpcEvents.GetIsAppDarkTheme
    );

    if (isDarkAppTheme) {
      document.body.classList.toggle(Classes.DARK);
      document.body.style.backgroundColor = LIGHT_UI_BACKGROUND;
    }

    setIsDarkTheme(isDarkAppTheme);
  };

  useEffect(() => {
    loadDarkThemeFromSettings();
  }, []);

  const setIsDarkThemeHook = (isAppDarkTheme: boolean) => {
    ipcRenderer.invoke(IpcEvents.SetIsAppDarkTheme, isAppDarkTheme);
    setIsDarkTheme(isAppDarkTheme);
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
