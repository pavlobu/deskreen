/* eslint-disable @typescript-eslint/lines-between-class-members */
import path from 'path';
import { BrowserWindow } from 'electron';

type RendererHelperWebcontentsID = number;

export default class RendererWebrtcHelpersService {
  helpers: Map<RendererHelperWebcontentsID, BrowserWindow>;
  appPath: string;

  constructor(_appPath: string) {
    this.helpers = new Map<RendererHelperWebcontentsID, BrowserWindow>();
    this.appPath = _appPath;
  }

  createPeerConnectionHelperRenderer() {
    let helperRendererWindow: BrowserWindow | null = null;

    helperRendererWindow = new BrowserWindow({
      show: false,
      // width: 300,
      // height: 300,
      // x: 2147483647,
      // y: 2147483647,
      // transparent: true,
      // frame: false,
      // // skipTaskbar: true,
      // focusable: false,
      // // parent: mainWindow,
      // hasShadow: false,
      // titleBarStyle: 'hidden',
      webPreferences:
        (process.env.NODE_ENV === 'development' ||
          process.env.E2E_BUILD === 'true') &&
        process.env.ERB_SECURE !== 'true'
          ? {
              nodeIntegration: true,
              enableRemoteModule: true,
            }
          : {
              preload: path.join(
                this.appPath,
                'dist/peerConnectionHelperRendererWindow.renderer.prod.js'
              ),
              enableRemoteModule: true,
            },
    });

    helperRendererWindow.loadURL(
      `file://${this.appPath}/peerConnectionHelperRendererWindow.html`
    );

    helperRendererWindow.webContents.on('did-finish-load', () => {
      if (!helperRendererWindow) {
        throw new Error('"helperRendererWindow" is not defined');
      }
      helperRendererWindow.webContents.send('start-peer-connection');
    });

    helperRendererWindow.on('closed', () => {
      helperRendererWindow = null;
    });

    this.helpers.set(helperRendererWindow.webContents.id, helperRendererWindow);

    if (process.env.NODE_ENV === 'dev') {
      helperRendererWindow.webContents.toggleDevTools();
    }

    return helperRendererWindow;
  }
}
