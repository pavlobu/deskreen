/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';

// export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';

interface AppContextInterface {
  isDarkTheme: boolean;
  setIsDarkThemeHook: (val: boolean) => void;
}

const defaultAppContextValue = {
  isDarkTheme: false,
  setIsDarkThemeHook: () => {},
};

export const AppContext = React.createContext<AppContextInterface>(
  defaultAppContextValue
);

export const AppContextProvider: React.FC = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const getThemeFromHost = () => {
    // const gotIsDarkThemeFromSettings = settings.hasSync('appIsDarkTheme')
    //   ? settings.getSync('appIsDarkTheme') === 'true'
    //   : false;

    // if (gotIsDarkThemeFromSettings) {
    //   document.body.classList.toggle(Classes.DARK);
    //   document.body.style.backgroundColor = LIGHT_UI_BACKGROUND;
    // }

    // setIsDarkTheme(gotIsDarkThemeFromSettings);
  };

  useEffect(() => {
    getThemeFromHost();
  }, []);

  const setIsDarkThemeHook = (val: boolean) => {
    // settings.setSync('appIsDarkTheme', `${val}`);
    setIsDarkTheme(val);
  };

  const value = { isDarkTheme, setIsDarkThemeHook };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
