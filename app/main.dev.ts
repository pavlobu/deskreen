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
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import store from './deskreen-electron-store';
import i18n from './configs/i18next.config';
import signalingServer from './server';
import MenuBuilder from './menu';
import initGlobals from './utils/mainProcessHelpers/initGlobals';
import AppUpdater from './utils/AppUpdater';
import installExtensions from './utils/installExtensions';
import getNewVersionTag from './utils/getNewVersionTag';
import initIpcMainHandlers from './main/ipcMainHandlers';
import { ElectronStoreKeys } from './enums/ElectronStoreKeys.enum';
import getDeskreenGlobal from './utils/mainProcessHelpers/getDeskreenGlobal';

export default class DeskreenApp {
  mainWindow: BrowserWindow | null = null;

  menuBuilder: MenuBuilder | null = null;

  latestAppVersion = '';

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

        const latestAppVersion = await getNewVersionTag();

        const showNotification = () => {
          const notification = {
            title: i18n.t('Deskreen Update is Available!'),
            body: `${i18n.t('Your current version is')} ${
              getDeskreenGlobal().currentAppVersion
            } | ${i18n.t(
              'Click to download new updated version'
            )} ${latestAppVersion}`,
          };
          const notificationInstance = new Notification(notification);
          notificationInstance.show();
          notificationInstance.on('click', (event) => {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            shell.openExternal('https://deskreen.com');
          });
        };

        if (
          latestAppVersion !== '' &&
          latestAppVersion !== getDeskreenGlobal().currentAppVersion
        ) {
          getDeskreenGlobal().latestAppVersion = latestAppVersion;
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
              contextIsolation: false,
              nodeIntegration: true,
            }
          : {
              preload: path.join(__dirname, 'dist/mainWindow.renderer.prod.js'),
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

    initIpcMainHandlers(this.mainWindow);
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
          if (store.has(ElectronStoreKeys.AppLanguage)) {
            store.delete(ElectronStoreKeys.AppLanguage);
          }
          store.set(ElectronStoreKeys.AppLanguage, lng);
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
  }
}

const deskreenApp = new DeskreenApp();
deskreenApp.start();
