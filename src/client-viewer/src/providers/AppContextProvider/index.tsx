import React, { useState } from 'react';

interface AppContextInterface {
  appLanguage: string;
  setAppLanguageHook: (val: string) => void;
}

const defaultAppContextValue = {
  appLanguage: 'en',
  setAppLanguageHook: () => {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext<AppContextInterface>(
  defaultAppContextValue
);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appLanguage, setAppLanguage] = useState('en');

  const setAppLanguageHook = (newLang: string) => {
    setAppLanguage(newLang);
  };

  const value = {
    appLanguage,
    setAppLanguageHook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
