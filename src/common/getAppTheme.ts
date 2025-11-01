// import { ipcRenderer } from 'electron';
import { IpcEvents } from './IpcEvents.enum';

export default async function getAppTheme(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isAppDarkTheme = await window.electron.ipcRenderer.invoke(IpcEvents.GetIsAppDarkTheme);
  return isAppDarkTheme;
}
