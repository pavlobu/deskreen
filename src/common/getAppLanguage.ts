import { IpcEvents } from './IpcEvents.enum';

export default async function getAppLanguage(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const appLanguage = await window.electron.ipcRenderer.invoke(IpcEvents.GetAppLanguage);
  return appLanguage;
}
