import { ElectronAPI } from '@electron-toolkit/preload'
import forge from 'node-forge';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      forge: typeof forge;
      Buffer: typeof Buffer;
    }
  }
}
