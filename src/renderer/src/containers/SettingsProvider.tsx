import React, { useState, useEffect } from 'react';
import { Classes } from '@blueprintjs/core';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import { IpcEvents } from '../../../common/IpcEvents.enum';

// TODO: move to 'constants' tsx file ?
export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';
export const DARK_UI_BACKGROUND = '#293742';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const loadDarkThemeFromSettings = async (): Promise<void> => {
    const isDarkAppTheme = await window.electron.ipcRenderer.invoke(IpcEvents.GetIsAppDarkTheme);

    if (isDarkAppTheme) {
      document.body.classList.toggle(Classes.DARK);
      document.body.style.backgroundColor = LIGHT_UI_BACKGROUND;
    }

    setIsDarkTheme(isDarkAppTheme);
  };

  useEffect(() => {
    loadDarkThemeFromSettings();
  }, []);

  const setIsDarkThemeHook = (isAppDarkTheme: boolean): void => {
    window.electron.ipcRenderer.invoke(IpcEvents.SetIsAppDarkTheme, isAppDarkTheme);
    setIsDarkTheme(isAppDarkTheme);
  };

  const setCurrentLanguageHook = (newLang: string): void => {
    setCurrentLanguage(newLang);
  };

  const value = {
    isDarkTheme,
    currentLanguage,
    setIsDarkThemeHook,
    setCurrentLanguageHook,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
