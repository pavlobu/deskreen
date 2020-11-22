/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Display } from 'electron/main';
import path from 'path';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import settings from 'electron-settings';
import i18n from './configs/i18next.config';
import signalingServer from './server';
import MenuBuilder from './menu';
import initGlobals from './mainProcessHelpers/initGlobals';
import ConnectedDevicesService from './features/ConnectedDevicesService';
import RoomIDService from './server/RoomIDService';
import SharingSession from './features/SharingSessionsService/SharingSession';
import getDeskreenGlobal from './mainProcessHelpers/getDeskreenGlobal';

initGlobals(__dirname);

signalingServer.start();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let menuBuilder: MenuBuilder | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 820,
    height: 540,
    minHeight: 400,
    minWidth: 600,
    titleBarStyle: 'hiddenInset',
    useContentSize: true,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
            enableRemoteModule: true,
          }
        : {
            preload: path.join(__dirname, 'dist/mainWindow.renderer.prod.js'),
            enableRemoteModule: true,
          },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // TODO: when app will be set to auto start on login, this will be not required,
    // TODO: the app will run until user didn't kill it in system tray
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // mainWindow.webContents.toggleDevTools();

  menuBuilder = new MenuBuilder(mainWindow, i18n);
  menuBuilder.buildMenu();

  i18n.on('loaded', () => {
    i18n.changeLanguage('en');
    i18n.off('loaded');
  });

  i18n.on('languageChanged', (lng) => {
    if (mainWindow === null) return;
    menuBuilder = new MenuBuilder(mainWindow, i18n);
    menuBuilder.buildMenu();
    setTimeout(async () => {
      if (lng !== 'en' && i18n.language !== lng) {
        i18n.changeLanguage(lng);
        await settings.set('appLanguage', lng);
      }
    }, 400);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // TODO: when app will be set to auto start on login, this will be not required,
  // TODO: the app will run until user didn't kill it in system tray
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.handle('get-signaling-server-port', () => {
  if (mainWindow === null) return;
  mainWindow.webContents.send('sending-port-from-main', signalingServer.port);
});

ipcMain.on('client-changed-language', async (_, newLangCode) => {
  i18n.changeLanguage(newLangCode);
  await settings.set('appLanguage', newLangCode);
});

ipcMain.handle('get-all-displays', () => {
  return screen.getAllDisplays();
});

ipcMain.handle('get-display-size-by-display-id', (_, displayID: string) => {
  const display = screen.getAllDisplays().find((d: Display) => {
    return `${d.id}` === displayID;
  });

  if (display) {
    return display.size;
  }
  return undefined;
});

ipcMain.handle('main-window-onbeforeunload', () => {
  const deskreenGlobal = getDeskreenGlobal();
  deskreenGlobal.connectedDevicesService = new ConnectedDevicesService();
  deskreenGlobal.roomIDService = new RoomIDService();
  deskreenGlobal.sharingSessionService.sharingSessions.forEach(
    (sharingSession: SharingSession) => {
      sharingSession.denyConnectionForPartner();
      sharingSession.destory();
    }
  );

  deskreenGlobal.rendererWebrtcHelpersService.helpers.forEach(
    (helperWindow) => {
      helperWindow.close();
    }
  );

  deskreenGlobal.sharingSessionService.waitingForConnectionSharingSession = null;
  deskreenGlobal.rendererWebrtcHelpersService.helpers.clear();
  deskreenGlobal.sharingSessionService.sharingSessions.clear();
});

app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage', '100');
