/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable react/prop-types */
/* eslint-disable import/prefer-default-export */
import React, { useState, useEffect } from 'react';
import settings from 'electron-settings';
import { Classes } from '@blueprintjs/core';

export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';
export const DARK_UI_BACKGROUND = '#293742';

interface SettingsContextInterface {
  isDarkTheme: boolean;
  setIsDarkThemeHook: (val: boolean) => void;
}

const defaultSettingsContextValue = {
  isDarkTheme: false,
  setIsDarkThemeHook: () => {},
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
  defaultSettingsContextValue
);

export const SettingsProvider: React.FC = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const loadDarkThemeFromSettings = () => {
    const gotIsDarkThemeFromSettings = settings.hasSync('appIsDarkTheme')
      ? settings.getSync('appIsDarkTheme') === 'true'
      : false;

    if (gotIsDarkThemeFromSettings) {
      document.body.classList.toggle(Classes.DARK);
      // if ()
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
    // if (!val) {
    //   document.body.style.backgroundColor = `${LIGHT_UI_BACKGROUND} !important`;
    // }
  };

  const value = { isDarkTheme, setIsDarkThemeHook };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
