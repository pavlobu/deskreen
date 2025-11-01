import { BrowserWindow } from 'electron';
import uuid from 'uuid';
import SharingSessionStatusEnum from './SharingSessionStatusEnum';
import SharingTypeEnum from './SharingTypeEnum';
import PeerConnectionHelperRendererService from '../PeerConnectionHelperRendererService';
import { Device } from '../../common/Device';
import { LocalPeerUser } from '../../common/LocalPeerUser';

export type SharingSessionStatusChangeListener = (sharingSessionID: string) => void;

export default class SharingSession {
  id: string;
  deviceID: string;
  sharingType: SharingTypeEnum;
  sharingStream: MediaStream | null;
  roomID: string;
  connectedDeviceAt: Date | null;
  sharingStartedAt: Date | null;
  status: SharingSessionStatusEnum;
  statusChangeListeners: SharingSessionStatusChangeListener[];
  peerConnectionHelperRenderer: BrowserWindow | undefined;
  onDeviceConnectedCallback: undefined | ((device: Device) => void);
  desktopCapturerSourceID: string;

  constructor(
    _roomID: string,
    user: LocalPeerUser,
    peerConnectionHelperRendererService: PeerConnectionHelperRendererService,
  ) {
    this.id = uuid.v4();
    this.deviceID = '';
    this.sharingType = SharingTypeEnum.NOT_SET;
    this.sharingStream = null;
    this.roomID = _roomID;
    this.connectedDeviceAt = null;
    this.sharingStartedAt = null;
    this.status = SharingSessionStatusEnum.NOT_CONNECTED;
    this.statusChangeListeners = [] as SharingSessionStatusChangeListener[];
    this.desktopCapturerSourceID = '';
    this.onDeviceConnectedCallback = undefined;

    if (process.env.RUN_MODE === 'test') return;

    this.peerConnectionHelperRenderer =
      peerConnectionHelperRendererService.createPeerConnectionHelperRenderer();

    this.peerConnectionHelperRenderer.webContents.on('did-finish-load', () => {
      // TODO: I need to remove dependency on renderer window, just to facilitate development
      // TODO: OR I can use a Utility or Child process to handle this. https://electron-vite.org/guide/dev#utility-process-and-child-process
      // TODO: probably using worker thread is the best option, but it will use the same resources as the main thread. child process is using more resources, but it is more isolated.
      // TODO: https://github.com/alex8088/electron-vite-worker-example
      this.peerConnectionHelperRenderer?.webContents.send('create-peer-connection-with-data', {
        roomID: this.roomID,
        sharingSessionID: this.id,
        user,
      });
    });

    this.peerConnectionHelperRenderer.webContents.on('ipc-message', (_, channel, data) => {
      if (channel === 'peer-connected') {
        if (this.onDeviceConnectedCallback) {
          this.onDeviceConnectedCallback(data);
        }
      }
    });

    this.statusChangeListeners.push(() => {
      if (this.status === SharingSessionStatusEnum.CONNECTED) {
        this.peerConnectionHelperRenderer?.webContents.send('send-user-allowed-to-connect');
      }
    });
  }

  destroy(): void {
    this.peerConnectionHelperRenderer?.close();
  }

  setOnDeviceConnectedCallback(callback: (device: Device) => void): void {
    this.onDeviceConnectedCallback = callback;
  }

  setDesktopCapturerSourceID(id: string): void {
    this.desktopCapturerSourceID = id;
    if (process.env.RUN_MODE === 'test') return;
    this.peerConnectionHelperRenderer?.webContents.send('set-desktop-capturer-source-id', id);
  }

  callPeer(): void {
    if (process.env.RUN_MODE === 'test') return;
    this.peerConnectionHelperRenderer?.webContents.send('call-peer');
  }

  disconnectByHostMachineUser(): void {
    this.peerConnectionHelperRenderer?.webContents.send(
      'disconnect-by-host-machine-user',
      this.deviceID,
    );
  }

  denyConnectionForPartner(): void {
    this.peerConnectionHelperRenderer?.webContents.send('deny-connection-for-partner');
  }

  appLanguageChanged(): void {
    this.peerConnectionHelperRenderer?.webContents.send('app-language-changed');
  }

  appThemeChanged(): void {
    this.peerConnectionHelperRenderer?.webContents.send('app-color-theme-changed');
  }

  addStatusChangeListener(callback: SharingSessionStatusChangeListener): void {
    this.statusChangeListeners.push(callback);
  }

  notifyStatusChangeListeners(): Promise<undefined> {
    return new Promise((resolve) => {
      for (let i = 0; i < this.statusChangeListeners.length; i += 1) {
        this.statusChangeListeners[i](this.id);
      }
      resolve(undefined);
    });
  }

  setStatus(newStatus: SharingSessionStatusEnum): void {
    this.status = newStatus;
    this.notifyStatusChangeListeners();
  }

  setDeviceID(deviceID: string): void {
    this.deviceID = deviceID;
  }
}
