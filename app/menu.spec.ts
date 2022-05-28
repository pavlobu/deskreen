/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jest/expect-expect */
import {
  app,
  BrowserWindow,
  shell,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import signalingServer from './server';
import MenuBuilder from './menu';

jest.useFakeTimers();

jest.mock('electron', () => {
  return {
    app: {
      quit: jest.fn(),
    },
    shell: {
      openExternal: jest.fn(),
    },
    Menu: {
      buildFromTemplate: jest.fn().mockReturnValue({
        popup: jest.fn(),
      }),
      setApplicationMenu: jest.fn(),
    },
  };
});

jest.mock('./server', () => {
  return {
    stop: jest.fn(),
  };
});

describe('app menu MenyBuilder tests', () => {
  let menuBuilder: MenuBuilder;
  let testMainWindow: BrowserWindow;
  let testI18n: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    testMainWindow = ({
      webContents: {
        on: jest.fn(),
        inspectElement: jest.fn(),
        reload: jest.fn(),
        toggleDevTools: jest.fn(),
      },
      setFullScreen: jest.fn(),
      isFullScreen: jest.fn(),
      inspectElement: jest.fn(),
    } as unknown) as BrowserWindow;

    testI18n = {
      t: jest.fn(),
      language: 'en',
      changeLanguage: jest.fn(),
    };

    menuBuilder = new MenuBuilder(testMainWindow, testI18n);
  });

  describe('when MenyBuilder created properly', () => {
    describe('when setupDevelopmentEnvironment was called', () => {
      it('should call .mainWindow.webContents.on("context-menu"', () => {
        menuBuilder.setupDevelopmentEnvironment();

        expect(testMainWindow.webContents.on).toBeCalledWith(
          'context-menu',
          expect.anything()
        );
      });

      describe('when .mainWindow.webContents.on("context-menu" event callback triggered (eg. righti click on any UI element in main host app window)', () => {
        it('should build menu with Inspect element on right click with proper coordinates', () => {
          const testProps = { x: 123, y: 321 };
          menuBuilder.setupDevelopmentEnvironment();
          // @ts-ignore
          const callback = testMainWindow.webContents.on.mock.calls[0][1];

          callback(undefined, testProps);

          expect(Menu.buildFromTemplate).toBeCalledWith([
            {
              label: 'Inspect element',
              click: expect.anything(),
            },
          ]);

          const inspectElementCallback =
            // @ts-ignore
            Menu.buildFromTemplate.mock.calls[0][0][0].click;

          inspectElementCallback();

          expect(testMainWindow.webContents.inspectElement).toBeCalledWith(
            testProps.x,
            testProps.y
          );
        });
      });
    });

    describe('when buildMenu was called', () => {
      describe('when buildMenu was called in dev environment', () => {
        it('should call setupDevelopmentEnvironment', () => {
          const setupDevelopmentEnvironmentBackup =
            menuBuilder.setupDevelopmentEnvironment;
          menuBuilder.setupDevelopmentEnvironment = jest.fn();

          const backupNodeEnv = process.env.NODE_ENV;
          const backupEnvDebugProd = process.env.DEBUG_PROD;

          process.env.NODE_ENV = 'development';

          menuBuilder.buildMenu();

          expect(menuBuilder.setupDevelopmentEnvironment).toBeCalled();

          process.env.NODE_ENV = backupNodeEnv;

          // @ts-ignore
          menuBuilder.setupDevelopmentEnvironment.mockClear();

          process.env.DEBUG_PROD = 'true';

          menuBuilder.buildMenu();
          expect(menuBuilder.setupDevelopmentEnvironment).toBeCalled();

          process.env.NODE_ENV = backupNodeEnv;
          process.env.DEBUG_PROD = backupEnvDebugProd;
          menuBuilder.setupDevelopmentEnvironment = setupDevelopmentEnvironmentBackup;
        });
      });

      describe('when buildMenu was called when process.platform === "darwin"', () => {
        it('should call buildDarwinTemplate and setApplicationMenu with built template', () => {
          const buildDarwinTemplateBackup = menuBuilder.buildDarwinTemplate;
          const testReturnMenu = [] as MenuItemConstructorOptions[];
          menuBuilder.buildDarwinTemplate = jest
            .fn()
            .mockReturnValueOnce(testReturnMenu);
          const testMenuMock = { asdf: 'asdf' };
          // @ts-ignore
          Menu.buildFromTemplate.mockReturnValueOnce(testMenuMock);

          const processBackup = process;

          // @ts-ignore
          // eslint-disable-next-line no-global-assign
          process = {
            ...processBackup,
            platform: 'darwin',
          };

          menuBuilder.buildMenu();

          expect(Menu.buildFromTemplate).toBeCalledWith(testReturnMenu);
          expect(menuBuilder.buildDarwinTemplate).toBeCalled();
          expect(Menu.setApplicationMenu).toBeCalledWith(testMenuMock);

          // @ts-ignore
          // eslint-disable-next-line no-global-assign
          process = processBackup;
          menuBuilder.buildDarwinTemplate = buildDarwinTemplateBackup;
        });
      });

      describe('when buildMenu was called when process.platform !== "darwin"', () => {
        it('should call setApplicationMenu with null', () => {
          const processBackup = process;

          // @ts-ignore
          // eslint-disable-next-line no-global-assign
          process = {
            ...processBackup,
            platform: 'linux',
          };

          menuBuilder.buildMenu();

          expect(Menu.setApplicationMenu).toBeCalledWith(null);

          // @ts-ignore
          // eslint-disable-next-line no-global-assign
          process = processBackup;
        });
      });
    });

    describe('when menu from buildDarwinTemplate was created', () => {
      describe('when in About submenu menu quit label click event occured', () => {
        it('should call app.quit() and stop() on signaling server, stop should be called before quit', () => {
          const res = menuBuilder.buildDarwinTemplate();
          const submenuAbout = res[0];
          const quitLabel =
            // @ts-ignore
            submenuAbout.submenu[submenuAbout.submenu.length - 1];

          quitLabel.click();

          expect(signalingServer.stop).toHaveBeenCalled();
          expect(app.quit).toHaveBeenCalled();
        });
      });

      describe('when menu was built in debug or dev environment', () => {
        describe('when in View submenu, Reload menu label was clicked', () => {
          it('should call .mainWindow.webContents.reload() on main window', () => {
            const prevNodeEnv = process.env.NODE_ENV;
            const prevEnvDebugProd = process.env.DEBUG_PROD;

            process.env.NODE_ENV = 'development';

            const menu1 = menuBuilder.buildDarwinTemplate();
            const submenuView1 = menu1[2];
            const reloadLabel =
              // @ts-ignore
              submenuView1.submenu[0];
            reloadLabel.click();

            expect(testMainWindow.webContents.reload).toBeCalled();
            // @ts-ignore
            testMainWindow.webContents.reload.mockClear();
            process.env.NODE_ENV = prevNodeEnv;

            process.env.DEBUG_PROD = 'true';
            const menu2 = menuBuilder.buildDarwinTemplate();
            const submenuView2 = menu2[2];
            const toggleDevTools =
              // @ts-ignore
              submenuView2.submenu[2];
            toggleDevTools.click();

            expect(testMainWindow.webContents.toggleDevTools).toBeCalled();
            // @ts-ignore
            testMainWindow.webContents.toggleDevTools.mockClear();

            const menu3 = menuBuilder.buildDarwinTemplate();
            const submenuView3 = menu3[2];
            const toggleFullScreen =
              // @ts-ignore
              submenuView3.submenu[1];
            toggleFullScreen.click();

            expect(testMainWindow.setFullScreen).toBeCalled();
            expect(testMainWindow.isFullScreen).toBeCalled();
            // @ts-ignore
            testMainWindow.webContents.toggleDevTools.mockClear();

            process.env.NODE_ENV = prevNodeEnv;
            process.env.DEBUG_PROD = prevEnvDebugProd;
          });
        });
      });

      describe('when menu was built in production environment', () => {
        describe('when toggle fullscreen was clicked', () => {
          it('should call setFullsScreen and isFullScreen on main window', () => {
            const menu = menuBuilder.buildDarwinTemplate();
            const submenuView = menu[2];
            const toggleFullScreen =
              // @ts-ignore
              submenuView.submenu[0];

            toggleFullScreen.click();

            expect(testMainWindow.setFullScreen).toBeCalled();
            expect(testMainWindow.isFullScreen).toBeCalled();
          });
        });
      });

      describe('when Help submenu Lean More was clicked', () => {
        it('shoud call shell open external with proper link to https://www.deskreen.com/', () => {
          const menu = menuBuilder.buildDarwinTemplate();
          const submenuView = menu[4];
          const learnMore =
            // @ts-ignore
            submenuView.submenu[0];

          learnMore.click();

          expect(shell.openExternal).toBeCalledWith(
            'https://www.deskreen.com/'
          );
        });
      });

      describe('when Help submenu Documentation was clicked', () => {
        it('shoud call shell open external with proper link to https://github.com/pavlobu/deskreen/blob/master/README.md', () => {
          const menu = menuBuilder.buildDarwinTemplate();
          const submenuView = menu[4];
          const learnMore =
            // @ts-ignore
            submenuView.submenu[1];

          learnMore.click();

          expect(shell.openExternal).toBeCalledWith(
            'https://github.com/pavlobu/deskreen/blob/master/README.md'
          );
        });
      });

      describe('when Help submenu Community Discussions was clicked', () => {
        it('shoud call shell open external with proper link to https://github.com/pavlobu/deskreen/discussions', () => {
          const menu = menuBuilder.buildDarwinTemplate();
          const submenuView = menu[4];
          const learnMore =
            // @ts-ignore
            submenuView.submenu[2];

          learnMore.click();

          expect(shell.openExternal).toBeCalledWith(
            'https://github.com/pavlobu/deskreen/discussions'
          );
        });
      });

      describe('when Help submenu Search Issues was clicked', () => {
        it('shoud call shell open external with proper link to https://github.com/pavlobu/deskreen/issues', () => {
          const menu = menuBuilder.buildDarwinTemplate();
          const submenuView = menu[4];
          const learnMore =
            // @ts-ignore
            submenuView.submenu[3];

          learnMore.click();

          expect(shell.openExternal).toBeCalledWith(
            'https://github.com/pavlobu/deskreen/issues'
          );
        });
      });
    });
  });
});
