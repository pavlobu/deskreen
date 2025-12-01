// override console early to catch all logs
import {
	overrideGlobalConsole,
	startConsoleRateLimiting,
} from '../common/rateLimitedConsole';
overrideGlobalConsole();
startConsoleRateLimiting();

import { app, shell, BrowserWindow, Notification } from 'electron';
import { join } from 'path';
import { is, optimizer } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

// function createWindow(): void {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: true,
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false,
//     },
//   });
//
//   mainWindow.on('ready-to-show', () => {
//     mainWindow.show();
//   });
//
//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url);
//     return { action: 'deny' };
//   });
//
//   // HMR for renderer base on electron-vite cli.
//   // Load the remote URL for development or the local html file for production.
//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
//   }
// }
//
// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   // Set app user model id for windows
//   electronApp.setAppUserModelId('com.deskreen');
//
//   // Default open or close DevTools by F12 in development
//   // and ignore CommandOrControl + R in production.
//   // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window);
//   });
//
//   // IPC test
//   ipcMain.on('ping', () => console.log('pong'));
//
//   createWindow();
//
//   app.on('activate', function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });
//
// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// import path from 'path';
// import { app, BrowserWindow } from 'electron';
import { store } from '../common/deskreen-electron-store';
// import i18n from './i18next.config';
import i18n from './configs/i18next.config';
import { signalingServer } from '../server';
import MenuBuilder from './menu';
import installExtensions from './utils/installExtensions';
import getNewVersionTag from './utils/getNewVersionTag';
import { initIpcMainHandlers } from './helpers/ipcMainHandlers';
import { initGlobals } from './helpers/initGlobals';
import { ElectronStoreKeys } from '../common/ElectronStoreKeys.enum';
import { getDeskreenGlobal } from './helpers/getDeskreenGlobal';
import { startLogBufferCleanup } from './utils/LoggerWithFilePrefix';

export default class DeskreenApp {
	mainWindow: BrowserWindow | null = null;

	menuBuilder: MenuBuilder | null = null;

	latestAppVersion = '';

	initElectronAppObject(): void {
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

		app.whenReady().then(async () => {
			app.setAppUserModelId('com.deskreen-ce.app');
			app.setActivationPolicy('regular');

			// start log buffer cleanup to prevent memory bloat
			startLogBufferCleanup();

			await this.createWindow();

			void this.checkForLatestVersionAndNotify();
		});

		app.on('browser-window-created', (_, window) => {
			optimizer.watchWindowShortcuts(window);
		});

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
			'100',
		);
	}

	private async checkForLatestVersionAndNotify(): Promise<void> {
		try {
			const latestAppVersion = await getNewVersionTag();
			const deskreenGlobal = getDeskreenGlobal();
			deskreenGlobal.latestAppVersion = latestAppVersion;
			this.latestAppVersion = latestAppVersion;

			if (
				latestAppVersion === '' ||
				latestAppVersion === deskreenGlobal.currentAppVersion ||
				!Notification.isSupported()
			) {
				return;
			}

			this.showUpdateNotification(latestAppVersion);
		} catch (error) {
			console.error('Failed to check for Deskreen updates', error);
		}
	}

	private showUpdateNotification(latestAppVersion: string): void {
		const deskreenGlobal = getDeskreenGlobal();
		const notification = new Notification({
			title: i18n.t('deskreen-ce-update-is-available'),
			body: `${i18n.t('your-current-version-is')} ${deskreenGlobal.currentAppVersion} | ${i18n.t(
				'click-to-download-new-updated-version',
			)} ${latestAppVersion}`,
		});

		notification.on('click', () => {
			void shell.openExternal('https://deskreen.com/download');
		});

		notification.show();
	}

	async createWindow(): Promise<void> {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			await installExtensions();
		}

		this.mainWindow = new BrowserWindow({
			show: false,
			width: 940,
			height: 640,
			minHeight: 460,
			minWidth: 640,
			titleBarStyle: 'hiddenInset',
			frame: process.platform === 'darwin' ? false : true,
			useContentSize: true,
			title: 'Deskreen CE',
			// useContentSize: true,
			autoHideMenuBar: true,
			...(process.platform === 'linux' ? { icon } : {}),
			webPreferences: {
				preload: join(__dirname, '../preload/index.js'),
				sandbox: false,
			},
		});

		// this.mainWindow.loadURL(`file://${__dirname}/app.html`);

		// @TODO: Use 'ready-to-show' event
		//        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
		this.mainWindow.on('ready-to-show', () => {
			// this.mainWindow.webContents.on('did-finish-load', () => {
			if (!this.mainWindow) {
				throw new Error('"mainWindow" is not defined');
			}
			if (process.env.START_MINIMIZED === 'true') {
				this.mainWindow.minimize();
			} else {
				this.mainWindow.show();
				this.mainWindow.focus();
			}
			// });
		});

		this.mainWindow.webContents.setWindowOpenHandler((details) => {
			shell.openExternal(details.url);
			return { action: 'deny' };
		});

		// HMR for renderer base on electron-vite cli.
		// Load the remote URL for development or the local html file for production.
		if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
			this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
		} else {
			this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
		}

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

		initIpcMainHandlers(this.mainWindow);
	}

	initI18n(): void {
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

	start(): void {
		// ensure only one instance of the app can run
		const gotTheLock = app.requestSingleInstanceLock();

		if (!gotTheLock) {
			// another instance is already running, quit this one
			app.quit();
			return;
		}

		// handle second instance attempts (e.g., clicking taskbar icon on windows)
		app.on('second-instance', () => {
			if (this.mainWindow) {
				if (this.mainWindow.isMinimized()) {
					this.mainWindow.restore();
				}
				this.mainWindow.focus();
				this.mainWindow.show();
			}
		});

		const cliLocalIp = this.parseCliLocalIp();
		initGlobals(join(__dirname, '..'), cliLocalIp);
		signalingServer.start();

		this.initElectronAppObject();
	}

	private parseCliLocalIp(): string | undefined {
		const args = process.argv;
		const localIpIndex = args.findIndex(
			(arg) => arg === '--local-ip' || arg === '--ip',
		);
		if (localIpIndex !== -1 && localIpIndex + 1 < args.length) {
			const ip = args[localIpIndex + 1];
			if (ip && !ip.startsWith('--')) {
				return ip;
			}
		}
		return undefined;
	}
}

export const deskreenApp = new DeskreenApp();
deskreenApp.start();
