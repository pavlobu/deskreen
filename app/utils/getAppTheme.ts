import { ipcRenderer } from 'electron';
import { IpcEvents } from '../main/IpcEvents.enum';

export default async function getAppTheme(): Promise<boolean> {
  const isAppDarkTheme = await ipcRenderer.invoke(IpcEvents.GetIsAppDarkTheme);
  return isAppDarkTheme;
}
