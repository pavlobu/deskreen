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
import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import settings from 'electron-settings';
import i18n from './configs/i18next.config';
import signalingServer from './server';
import MenuBuilder from './menu';
import initGlobals from './utils/mainProcessHelpers/initGlobals';
import ConnectedDevicesService from './features/ConnectedDevicesService';
import RoomIDService from './server/RoomIDService';
import SharingSession from './features/SharingSessionService/SharingSession';
import getDeskreenGlobal from './utils/mainProcessHelpers/getDeskreenGlobal';
import AppUpdater from './utils/AppUpdater';
import installExtensions from './utils/installExtensions';
import getNewVersionTag from './utils/getNewVersionTag';

const v4IPGetter = require('internal-ip').v4;

export default class DeskreenApp {
  mainWindow: BrowserWindow | null = null;

  menuBuilder: MenuBuilder | null = null;

  appVersion: string = app.getVersion();

  latestVersion = '';

  initElectronAppObject() {
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
      app.whenReady().then(this.createWindow);
    } else {
      app.on('ready', async () => {
        this.createWindow();

        const { Notification } = require('electron');

        const showNotification = () => {
          const notification = {
            title: i18n.t('Deskreen Update is Available!'),
            body: `${i18n.t('Your current version is')} ${
              this.appVersion
            } | ${i18n.t('Click to download new updated version')} ${
              this.latestVersion
            }`,
          };
          const notificationInstance = new Notification(notification);
          notificationInstance.show();
          notificationInstance.on('click', (event) => {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            shell.openExternal('https://deskreen.com');
          });
        };

        const newVersion = await getNewVersionTag();

        if (newVersion !== '' && newVersion !== this.appVersion) {
          this.latestVersion = newVersion;
          showNotification();
        }
      });
    }

    app.on('activate', (e) => {
      e.preventDefault();
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });

    app.commandLine.appendSwitch(
      'webrtc-max-cpu-consumption-percentage',
      '100'
    );
  }

  initIpcMain() {
    ipcMain.on('client-changed-language', async (_, newLangCode) => {
      i18n.changeLanguage(newLangCode);
      await settings.set('appLanguage', newLangCode);
    });

    ipcMain.handle('get-signaling-server-port', () => {
      if (this.mainWindow === null) return;
      this.mainWindow.webContents.send(
        'sending-port-from-main',
        signalingServer.port
      );
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
          sharingSession.destroy();
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

    ipcMain.handle('get-latest-version', () => {
      return this.latestVersion;
    });

    ipcMain.handle('get-current-version', () => {
      return this.appVersion;
    });

    ipcMain.handle('get-local-lan-ip', async () => {
      if (
        process.env.RUN_MODE === 'dev' ||
        process.env.NODE_ENV === 'production'
      ) {
        const ip = await v4IPGetter();
        return ip;
      }
      return '255.255.255.255';
    });
  }

  async createWindow() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    this.mainWindow = new BrowserWindow({
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

    this.mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    this.mainWindow.webContents.on('did-finish-load', () => {
      if (!this.mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED === 'true') {
        this.mainWindow.minimize();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      // TODO: when app will be set to auto start on login, this will be not required,
      // TODO: the app will run until user didn't kill it in system tray
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    if (process.env.NODE_ENV === 'dev') {
      this.mainWindow.webContents.toggleDevTools();
    }

    this.menuBuilder = new MenuBuilder(this.mainWindow, i18n);
    this.menuBuilder.buildMenu();

    this.initI18n();

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  }

  initI18n() {
    i18n.on('loaded', () => {
      i18n.changeLanguage('en');
      i18n.off('loaded');
    });

    i18n.on('languageChanged', (lng) => {
      if (this.mainWindow === null) return;
      this.menuBuilder = new MenuBuilder(this.mainWindow, i18n);
      this.menuBuilder.buildMenu();
      setTimeout(async () => {
        if (lng !== 'en' && i18n.language !== lng) {
          i18n.changeLanguage(lng);
          await settings.set('appLanguage', lng);
        }
      }, 400);
    });
  }

  start() {
    initGlobals(__dirname);
    signalingServer.start();

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

    this.initElectronAppObject();
    this.initIpcMain();
  }
}

const deskreenApp = new DeskreenApp();
deskreenApp.start();
