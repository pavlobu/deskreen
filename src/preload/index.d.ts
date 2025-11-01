import { ElectronAPI } from '@electron-toolkit/preload'
import forge from 'node-forge';
import nacl from 'tweetnacl';

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      nacl: typeof nacl;
      naclBox: typeof nacl.box;
      naclBoxOpen: typeof nacl.box.open;
      naclBoxKeyPair: typeof nacl.box.keyPair;
      naclBoxKeyPairFromSecretKey: typeof nacl.box.keyPair.fromSecretKey;
      naclRandomBytes: typeof nacl.randomBytes;
      naclBoxNonceLength: number;
      forge: typeof forge;
      Buffer: typeof Buffer;
    }
  }
}
