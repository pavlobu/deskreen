import { useContext, useCallback } from 'react';
import { Button, Classes, ControlGroup } from '@blueprintjs/core';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import { IpcEvents } from '../../../../common/IpcEvents.enum';

export default function ToggleThemeBtnGroup() {
  const { isDarkTheme, setIsDarkThemeHook } = useContext(SettingsContext);

  const handleToggleDarkTheme = useCallback(() => {
    if (!isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(true);
    }
    window.electron.ipcRenderer.invoke(IpcEvents.NotifyAllSessionsWithAppThemeChanged);
  }, [isDarkTheme, setIsDarkThemeHook]);

  const handleToggleLightTheme = useCallback(() => {
    if (isDarkTheme) {
      document.body.classList.toggle(Classes.DARK);
      setIsDarkThemeHook(false);
    }
    window.electron.ipcRenderer.invoke(IpcEvents.NotifyAllSessionsWithAppThemeChanged);
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
