/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

import signalingServer from './server';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  i18n: any;

  constructor(mainWindow: BrowserWindow, i18n: any) {
    this.mainWindow = mainWindow;
    this.i18n = i18n;
  }

  buildMenu() {
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
      label: 'Deskreen',
      submenu: [
        {
          label: this.i18n.t('About Deskreen'),
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: this.i18n.t('Hide Deskreen'),
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: this.i18n.t('Hide Others'),
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: this.i18n.t('Show All'), selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: this.i18n.t('Quit'),
          accelerator: 'Command+Q',
          click: () => {
            signalingServer.stop();
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: this.i18n.t('Edit'),
      submenu: [
        {
          label: this.i18n.t('Undo'),
          accelerator: 'Command+Z',
          selector: 'undo:',
        },
        {
          label: this.i18n.t('Redo'),
          accelerator: 'Shift+Command+Z',
          selector: 'redo:',
        },
        { type: 'separator' },
        {
          label: this.i18n.t('Cut'),
          accelerator: 'Command+X',
          selector: 'cut:',
        },
        {
          label: this.i18n.t('Copy'),
          accelerator: 'Command+C',
          selector: 'copy:',
        },
        {
          label: this.i18n.t('Paste'),
          accelerator: 'Command+V',
          selector: 'paste:',
        },
        {
          label: this.i18n.t('Select All'),
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: this.i18n.t('View'),
      submenu: [
        {
          label: this.i18n.t('Reload'),
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: this.i18n.t('Toggle Full Screen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: this.i18n.t('Toggle Developer Tools'),
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: this.i18n.t('Toggle Full Screen'),
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: this.i18n.t('Window'),
      submenu: [
        {
          label: this.i18n.t('Minimize'),
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        {
          label: this.i18n.t('Close'),
          accelerator: 'Command+W',
          selector: 'performClose:',
        },
        { type: 'separator' },
        {
          label: this.i18n.t('Bring All to Front'),
          selector: 'arrangeInFront:',
        },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: this.i18n.t('Help'),
      submenu: [
        {
          label: this.i18n.t('Learn More'),
          click() {
            shell.openExternal('https://www.deskreen.com/');
          },
        },
        {
          label: this.i18n.t('Documentation'),
          click() {
            shell.openExternal(
              'https://github.com/pavlobu/deskreen/blob/master/README.md'
            );
          },
        },
        {
          label: this.i18n.t('Community Discussions'),
          click() {
            shell.openExternal(
              'https://github.com/pavlobu/deskreen/discussions'
            );
          },
        },
        {
          label: this.i18n.t('Search Issues'),
          click() {
            shell.openExternal('https://github.com/pavlobu/deskreen/issues');
          },
        },
      ],
    };

    // const subMenuView =
    //   process.env.NODE_ENV === 'development' ||
    //   process.env.DEBUG_PROD === 'true'
    //     ? subMenuViewDev
    //     : subMenuViewProd;
    const subMenuView = subMenuViewDev;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }
}
