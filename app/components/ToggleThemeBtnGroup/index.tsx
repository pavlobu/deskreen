// import { remote } from 'electron';
import React, { useContext, useCallback } from 'react';
import { Button, Classes, ControlGroup } from '@blueprintjs/core';
import SharingSessionService from '../../features/SharingSessionService';
import { SettingsContext } from '../../containers/SettingsProvider';

// const sharingSessionService = remote.getGlobal(
//   'sharingSessionService'
// ) as SharingSessionService;

export default function ToggleThemeBtnGroup() {
  const { isDarkTheme, setIsDarkThemeHook } = useContext(SettingsContext);

  const handleToggleDarkTheme = useCallback(() => {
    if (!isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(true);
    }
    // TODO: call sharing sessions service here to notify all connected clients about theme change
    // sharingSessionService.sharingSessions.forEach((sharingSession) => {
    //   sharingSession?.appThemeChanged();
    // });
  }, [isDarkTheme, setIsDarkThemeHook]);

  const handleToggleLightTheme = useCallback(() => {
    if (isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(false);
    }
    // TODO: call sharing sessions service here to notify all connected clients about theme change
    // sharingSessionService.sharingSessions.forEach((sharingSession) => {
    //   sharingSession?.appThemeChanged();
    // });
  }, [isDarkTheme, setIsDarkThemeHook]);

  return (
    <ControlGroup fill vertical={false} style={{ width: '120px' }}>
      <Button
        id="light-theme-toggle-btn"
        icon="flash"
        onClick={handleToggleLightTheme}
        active={!isDarkTheme}
        style={{ borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' }}
      />
      <Button
        id="dark-theme-toggle-btn"
        icon="moon"
        onClick={handleToggleDarkTheme}
        active={isDarkTheme}
        style={{
          borderTopRightRadius: '50px',
          borderBottomRightRadius: '50px',
        }}
      />
    </ControlGroup>
  );
}
