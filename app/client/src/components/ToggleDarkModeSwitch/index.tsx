import React, { useContext } from 'react';
import { Switch, Classes, Alignment } from '@blueprintjs/core';
import { AppContext } from '../../providers/AppContextProvider';

function ToggleDarkModeSwitch() {
  const { isDarkTheme, setIsDarkThemeHook } = useContext(AppContext)

  return (
    <Switch
      onChange={() => {
        document.body.classList.toggle(Classes.DARK);
        setIsDarkThemeHook(!isDarkTheme)
      }}
      innerLabel={isDarkTheme ? 'ON' : 'OFF'}
      inline
      large
      label={`Dark Theme is`}
      alignIndicator={Alignment.RIGHT}
      checked={isDarkTheme}
      style={{ marginTop: '25px', marginLeft: '15px' }}
    />
  );
}

export default ToggleDarkModeSwitch;
