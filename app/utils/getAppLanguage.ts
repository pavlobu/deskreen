import { ipcRenderer } from 'electron';
import { IpcEvents } from '../main/IpcEvents.enum';

export default async function getAppLanguage(): Promise<string> {
  const appLanguage = await ipcRenderer.invoke(IpcEvents.GetAppLanguage);
  return appLanguage;
}
