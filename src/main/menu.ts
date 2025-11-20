import {
	Menu,
	shell,
	BrowserWindow,
	MenuItemConstructorOptions,
	app,
} from 'electron';

import i18nType from './configs/i18next.config';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
	selector?: string;
	submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
	mainWindow: BrowserWindow;

	i18n: typeof i18nType;

	constructor(mainWindow: BrowserWindow, i18n: typeof i18nType) {
		this.mainWindow = mainWindow;
		this.i18n = i18n;
	}

	buildMenu(): void {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			this.setupDevelopmentEnvironment();
		}

		if (process.platform === 'darwin') {
			const menu = Menu.buildFromTemplate(this.buildDarwinTemplate());
			Menu.setApplicationMenu(menu);
		} else {
			// for production, no menu for non MacOS app
			Menu.setApplicationMenu(null);
		}
	}

	setupDevelopmentEnvironment(): void {
		this.mainWindow.webContents.on('context-menu', (_, props) => {
			const { x, y } = props;

			Menu.buildFromTemplate([
				{
					label: 'Inspect element',
					click: () => {
						this.mainWindow.webContents.inspectElement(x, y);
					},
				},
			]).popup({ window: this.mainWindow });
		});
	}

	buildDarwinTemplate(): MenuItemConstructorOptions[] {
		const subMenuAbout: DarwinMenuItemConstructorOptions = {
			label: 'Deskreen CE',
			submenu: [
				{
					label: this.i18n.t('about-deskreen'),
					selector: 'orderFrontStandardAboutPanel:',
				},
				{ type: 'separator' },
				{
					label: this.i18n.t('hide-deskreen'),
					accelerator: 'Command+H',
					selector: 'hide:',
				},
				{
					label: this.i18n.t('hide-others'),
					accelerator: 'Command+Shift+H',
					selector: 'hideOtherApplications:',
				},
				{ label: this.i18n.t('show-all'), selector: 'unhideAllApplications:' },
				{ type: 'separator' },
				{
					label: this.i18n.t('quit'),
					accelerator: 'Command+Q',
					click: () => {
						app.quit();
					},
				},
			],
		};
		const subMenuEdit: DarwinMenuItemConstructorOptions = {
			label: this.i18n.t('edit'),
			submenu: [
				{
					label: this.i18n.t('undo'),
					accelerator: 'Command+Z',
					selector: 'undo:',
				},
				{
					label: this.i18n.t('redo'),
					accelerator: 'Shift+Command+Z',
					selector: 'redo:',
				},
				{ type: 'separator' },
				{
					label: this.i18n.t('cut'),
					accelerator: 'Command+X',
					selector: 'cut:',
				},
				{
					label: this.i18n.t('copy'),
					accelerator: 'Command+C',
					selector: 'copy:',
				},
				{
					label: this.i18n.t('paste'),
					accelerator: 'Command+V',
					selector: 'paste:',
				},
				{
					label: this.i18n.t('select-all'),
					accelerator: 'Command+A',
					selector: 'selectAll:',
				},
			],
		};
		const subMenuViewDev: MenuItemConstructorOptions = {
			label: this.i18n.t('view'),
			submenu: [
				{
					label: this.i18n.t('reload'),
					accelerator: 'Command+R',
					click: () => {
						this.mainWindow.webContents.reload();
					},
				},
				{
					label: this.i18n.t('toggle-full-screen'),
					accelerator: 'Ctrl+Command+F',
					click: () => {
						this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
					},
				},
				{
					label: this.i18n.t('toggle-developer-tools'),
					accelerator: 'Alt+Command+I',
					click: () => {
						this.mainWindow.webContents.toggleDevTools();
					},
				},
			],
		};
		const subMenuViewProd: MenuItemConstructorOptions = {
			label: this.i18n.t('view'),
			submenu: [
				{
					label: this.i18n.t('toggle-full-screen'),
					accelerator: 'Ctrl+Command+F',
					click: () => {
						this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
					},
				},
			],
		};
		const subMenuWindow: DarwinMenuItemConstructorOptions = {
			label: this.i18n.t('window'),
			submenu: [
				{
					label: this.i18n.t('minimize'),
					accelerator: 'Command+M',
					selector: 'performMiniaturize:',
				},
				{
					label: this.i18n.t('close'),
					accelerator: 'Command+W',
					selector: 'performClose:',
				},
				{ type: 'separator' },
				{
					label: this.i18n.t('bring-all-to-front'),
					selector: 'arrangeInFront:',
				},
			],
		};
		const subMenuHelp: MenuItemConstructorOptions = {
			label: this.i18n.t('help'),
			submenu: [
				{
					label: this.i18n.t('learn-more'),
					click() {
						shell.openExternal('https://www.deskreen.com');
					},
				},
				// {
				//   label: this.i18n.t('Documentation'),
				//   click() {
				//     shell.openExternal(
				//       'https://github.com/pavlobu/deskreen/blob/master/README.md'
				//     );
				//   },
				// },
				// {
				//   label: this.i18n.t('Community Discussions'),
				//   click() {
				//     shell.openExternal(
				//       'https://github.com/pavlobu/deskreen/discussions'
				//     );
				//   },
				// },
				// {
				//   label: this.i18n.t('Search Issues'),
				//   click() {
				//     shell.openExternal('https://github.com/pavlobu/deskreen/issues');
				//   },
				// },
			],
		};

		const subMenuView =
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
				? subMenuViewDev
				: subMenuViewProd;

		return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
	}
}
