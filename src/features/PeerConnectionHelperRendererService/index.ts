import { join } from 'path';
import { BrowserWindow } from 'electron';
import { is } from '@electron-toolkit/utils';

type RendererHelperWebcontentsID = number;

export default class RendererWebrtcHelpersService {
	helpers: Map<RendererHelperWebcontentsID, BrowserWindow>;
	appPath: string;

	constructor(_appPath: string) {
		this.helpers = new Map<RendererHelperWebcontentsID, BrowserWindow>();
		this.appPath = _appPath;
	}

	createPeerConnectionHelperRenderer(): BrowserWindow {
		let helperRendererWindow: BrowserWindow | null = null;

		helperRendererWindow = new BrowserWindow({
			show: is.dev, // show in dev only
			webPreferences: {
				preload: join(__dirname, '../preload/index.js'),
				// contextIsolation: true,
				// nodeIntegration: true,
				nodeIntegration: true,
				nodeIntegrationInSubFrames: true,
				nodeIntegrationInWorker: true,
				sandbox: false,
			},
		});

		helperRendererWindow.loadURL(
			`file://${this.appPath}/renderer/peerConnectionHelperRendererWindowIndex.html`,
		);

		helperRendererWindow.webContents.on('did-finish-load', () => {
			if (!helperRendererWindow) {
				throw new Error('"helperRendererWindow" is not defined');
			}
			helperRendererWindow.webContents.send('start-peer-connection');
		});

		const helperId = helperRendererWindow.webContents.id;
		// cleanup tracking map on close to prevent memory leaks
		helperRendererWindow.on('closed', () => {
			this.helpers.delete(helperId);
			helperRendererWindow = null;
		});

		this.helpers.set(helperId, helperRendererWindow);

		if (process.env.NODE_ENV === 'dev') {
			helperRendererWindow.webContents.toggleDevTools();
		}
		// helperRendererWindow.webContents.toggleDevTools();

		return helperRendererWindow;
	}
}
