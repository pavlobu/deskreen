import { Classes } from '@blueprintjs/core';
import React, { useState } from 'react';
import {
  DARK_UI_BACKGROUND,
  LIGHT_UI_BACKGROUND,
} from '../../constants/styleConstants';

interface AppContextInterface {
  isDarkTheme: boolean;
  setIsDarkThemeHook: (val: boolean) => void;
}

const defaultAppContextValue = {
  isDarkTheme: false,
  setIsDarkThemeHook: () => {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext<AppContextInterface>(
  defaultAppContextValue
);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [appLanguage, setAppLanguage] = useState('en');

  const setIsDarkThemeHook = (val: boolean) => {
      document.body.classList.toggle(Classes.DARK);

      document.body.style.backgroundColor = val
        ? DARK_UI_BACKGROUND
        : LIGHT_UI_BACKGROUND;
      setIsDarkTheme(val);
  };

  const setAppLanguageHook = (newLang: string) => {
    setAppLanguage(newLang);
  };

  const value = {
    isDarkTheme,
    setIsDarkThemeHook,
    appLanguage,
    setAppLanguageHook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
