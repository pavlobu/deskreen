// // /* eslint-disable @typescript-eslint/ban-ts-comment */

// // import { BrowserWindow, app, ipcMain, screen } from 'electron';
// // import settings from 'electron-settings';
// // import DeskreenApp from './main.dev';
// // import initGlobals from './utils/mainProcessHelpers/initGlobals';
// // import signalingServer from './server';
// // import MenuBuilder from './menu';
// // import i18n from './configs/i18next.config';
// // import getDeskreenGlobal from './utils/mainProcessHelpers/getDeskreenGlobal';
// // import ConnectedDevicesService from './features/ConnectedDevicesService';
// // import SharingSessionService from './features/SharingSessionService';
// // import RendererWebrtcHelpersService from './features/PeerConnectionHelperRendererService';
// // import installExtensions from './utils/installExtensions';

// // const sourceMapSupport = require('source-map-support');
// // const electronDebug = require('electron-debug');
// // const electronDevToolsInstaller = require('electron-devtools-installer');

// // const TEST_SIGNALING_SERVER_PORT = '4343';
// // const TEST_DISPLAY_ID = 'd1';
// // const TEST_DISPLAY_SIZE = { width: 600, height: 400 };
// // const TEST_SCREEN_GET_ALL_DISPLAYS_RESULT = [
// //   { id: 'd1', size: { width: 600, height: 400 } },
// //   { id: 'd2' },
// //   { id: 'd3' },
// // ];
// const testMapSharingSessions = new Map();
// testMapSharingSessions.set('1', {
//   denyConnectionForPartner: jest.fn(),
//   destroy: jest.fn(),
// });
// testMapSharingSessions.set('2', {
//   denyConnectionForPartner: jest.fn(),
//   destroy: jest.fn(),
// });
// const TEST_SHARING_SESSIONS_SERVICE = ({
//   waitingForConnectionSharingSession: '2342a',
//   sharingSessions: testMapSharingSessions,
// } as unknown) as SharingSessionService;
// const testMapHelpers = new Map();
// testMapHelpers.set('1', { close: jest.fn() });
// testMapHelpers.set('2', { close: jest.fn() });
// const TEST_RENDERER_WEBRTC_HELPERS_SERVICE = ({
//   helpers: testMapHelpers,
// } as unknown) as RendererWebrtcHelpersService;
// const mockGlobal = {
//   connectedDevicesService: TEST_CONNECTED_DEVICES_SERVICE,
//   roomIDService: TEST_ROOM_ID_SERVICE,
//   sharingSessionService: TEST_SHARING_SESSIONS_SERVICE,
//   rendererWebrtcHelpersService: TEST_RENDERER_WEBRTC_HELPERS_SERVICE,
// };

// jest.useFakeTimers();

// jest.mock('./utils/installExtensions');
// jest.mock('./utils/AppUpdater');
// jest.mock('./main.dev', () => {
//   return {
//     __esModule: true, // this property makes it work
//     default: jest.requireActual('./main.dev').default,
//   };
// });
// jest.mock('./utils/mainProcessHelpers/getDeskreenGlobal');
// jest.mock('./utils/mainProcessHelpers/initGlobals');
// jest.mock('electron', () => {
//   return {
//     app: {
//       quit: jest.fn(),
//       on: jest.fn(),
//       getName: jest.fn(),
//       getVersion: jest.fn(),
//       commandLine: {
//         appendSwitch: jest.fn(),
//       },
//       whenReady: jest
//         .fn()
//         .mockReturnValue(new Promise((resolve) => resolve(undefined))),
//     },
//     ipcMain: {
//       handle: jest.fn(),
//       on: jest.fn(),
//     },
//     screen: {
//       getAllDisplays: jest
//         .fn()
//         .mockReturnValue(TEST_SCREEN_GET_ALL_DISPLAYS_RESULT),
//     },
//     BrowserWindow: jest.fn().mockReturnValue({
//       loadURL: jest.fn(),
//       on: jest.fn(),
//       webContents: {
//         on: jest.fn(),
//         toggleDevTools: jest.fn(),
//       },
//       minimize: jest.fn(),
//       show: jest.fn(),
//       focus: jest.fn(),
//     }),
//   };
// });
// jest.mock('./server', () => {
//   return {
//     start: jest.fn(),
//     port: TEST_SIGNALING_SERVER_PORT,
//   };
// });
// jest.mock('source-map-support', () => {
//   return {
//     install: jest.fn(),
//   };
// });
// jest.mock('electron-debug');
// jest.mock('electron-devtools-installer', () => {
//   return {
//     default: jest.fn(),
//     REACT_DEVELOPER_TOOLS: 'REACT_DEVELOPER_TOOLS',
//     REDUX_DEVTOOLS: 'REDUX_DEVTOOLS',
//   };
// });
// jest.mock('./configs/i18next.config', () => {
//   return {
//     on: jest.fn(),
//     changeLanguage: jest.fn(),
//     off: jest.fn(),
//     language: 'sv',
//   };
// });
// jest.mock('./menu');
// jest.mock('electron-settings', () => {
//   return {
//     set: jest.fn(),
//   };
// });

// describe('app main.dev tests', () => {
//   let testApp: DeskreenApp;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//     // @ts-ignore
//     MenuBuilder.mockClear();
//     // @ts-ignore
//     installExtensions.mockClear();

//     testApp = new DeskreenApp();
//   });

//   describe('when DeskreenApp created properly', () => {
//     describe('when .start() was called', () => {
//       it('should call initGlobals', () => {
//         testApp.start();

//         expect(initGlobals).toBeCalled();
//       });

//       it('should call signalingServer.start()', () => {
//         testApp.start();

//         expect(signalingServer.start).toBeCalled();
//       });

//       it('should call .initElectronAppObject()', () => {
//         testApp.initElectronAppObject = jest.fn();

//         testApp.start();

//         expect(testApp.initElectronAppObject).toBeCalled();
//       });

//       it('should call .initIpcMain()', () => {
//         testApp.initIpcMain = jest.fn();

//         testApp.start();

//         expect(testApp.initIpcMain).toBeCalled();
//       });

//       describe('when initElectronAppObject was called', () => {
//         it('should set app.on("window-all-closed" listener', () => {
//           testApp.initElectronAppObject();

//           expect(app.on).toHaveBeenCalledWith(
//             'window-all-closed',
//             expect.anything()
//           );
//         });

//         it('should call app.commandLine.appendSwitch with "webrtc-max-cpu-consumption-percentage","100"', () => {
//           testApp.initElectronAppObject();

//           expect(app.commandLine.appendSwitch).toHaveBeenCalledWith(
//             'webrtc-max-cpu-consumption-percentage',
//             '100'
//           );
//         });

//         describe('when process.env.E2E_BUILD !== "true"', () => {
//           it('should set app.on("ready" listener', () => {
//             const processEnvBackup = process.env.E2E_BUILD;
//             process.env.E2E_BUILD = 'false';

//             testApp.initElectronAppObject();

//             expect(app.on).toHaveBeenCalledWith('ready', expect.anything());

//             process.env.E2E_BUILD = processEnvBackup;
//           });
//         });

//         describe('when process.env.E2E_BUILD === "true"', () => {
//           it('should set app.on("ready" listener', () => {
//             const processEnvBackup = process.env.E2E_BUILD;
//             process.env.E2E_BUILD = 'true';

//             testApp.initElectronAppObject();

//             expect(app.whenReady).toHaveBeenCalled();

//             process.env.E2E_BUILD = processEnvBackup;
//           });
//         });

//         describe('when app.on("window-all-closed" event occured', () => {
//           describe('when running on NOT darwin platform', () => {
//             it('should call app.quit()', () => {
//               const processBackup = process;
//               // @ts-ignore
//               // eslint-disable-next-line no-global-assign
//               process = {
//                 ...processBackup,
//                 platform: 'linux',
//               };

// //               testApp.initElectronAppObject();

// //               // @ts-ignore
// //               const callback = app.on.mock.calls[0][1];
// //               callback();

// //               expect(app.quit).toBeCalled();

// //               // @ts-ignore
// //               // eslint-disable-next-line no-global-assign
// //               process = processBackup;
// //             });
// //           });

// //           describe('when running on darwin platform', () => {
// //             it('should NOT call app.quit()', () => {
// //               const processBackup = process;
// //               // @ts-ignore
// //               // eslint-disable-next-line no-global-assign
// //               process = {
// //                 ...processBackup,
// //                 platform: 'darwin',
// //               };

// //               testApp.initElectronAppObject();

// //               // @ts-ignore
// //               const callback = app.on.mock.calls[0][1];
// //               callback();

// //               expect(app.quit).not.toBeCalled();

// //               // @ts-ignore
// //               // eslint-disable-next-line no-global-assign
// //               process = processBackup;
// //             });
// //           });
// //         });

// //         describe('when app.on("activate" event occured', () => {
// //           it('should call .createWindow if mainWindow is null', () => {
// //             testApp.mainWindow = null;
// //             testApp.createWindow = jest.fn();

// //             testApp.initElectronAppObject();

// //             // @ts-ignore
// //             const callback = app.on.mock.calls[2][1];
// //             callback({ preventDefault: () => {} });

// //             expect(testApp.createWindow).toBeCalled();
// //           });

// //           it('should NOT call .createWindow if mainWindow is not null', () => {
// //             testApp.mainWindow = ({
// //               asdf: 'agasg',
// //             } as unknown) as BrowserWindow;
// //             testApp.createWindow = jest.fn();

// //             testApp.initElectronAppObject();

// //             // @ts-ignore
// //             const callback = app.on.mock.calls[2][1];
// //             callback({ preventDefault: () => {} });

// //             expect(testApp.createWindow).not.toBeCalled();
// //           });
// //         });
// //       });

// //       describe('when initIpcMain was called', () => {
// //         it('should set ipcMain.on("client-changed-language" listener', () => {
// //           testApp.initIpcMain();

// //           expect(ipcMain.on).toHaveBeenCalledWith(
// //             'client-changed-language',
// //             expect.anything()
// //           );
// //         });

// //         it('should set ipcMain.handle("get-signaling-server-port" listener', () => {
// //           testApp.initIpcMain();

// //           expect(ipcMain.handle).toHaveBeenCalledWith(
// //             'get-signaling-server-port',
// //             expect.anything()
// //           );
// //         });

// //         it('should set ipcMain.handle("get-all-displays" listener', () => {
// //           testApp.initIpcMain();

// //           expect(ipcMain.handle).toHaveBeenCalledWith(
// //             'get-all-displays',
// //             expect.anything()
// //           );
// //         });

// //         it('should set ipcMain.handle("get-display-size-by-display-id" listener', () => {
// //           testApp.initIpcMain();

// //           expect(ipcMain.handle).toHaveBeenCalledWith(
// //             'get-display-size-by-display-id',
// //             expect.anything()
// //           );
// //         });

// //         it('should set ipcMain.handle("main-window-onbeforeunload" listener', () => {
// //           testApp.initIpcMain();

// //           expect(ipcMain.handle).toHaveBeenCalledWith(
// //             'main-window-onbeforeunload',
// //             expect.anything()
// //           );
// //         });

// //         describe('when ipcMain.on("client-changed-language" callback was called', () => {
// //           it('should call i18n.changeLanguage and settings.set("appLanguage", newLangCode)', async () => {
// //             const testNewLang = 'bz';

// //             testApp.initIpcMain();

// //             // @ts-ignore
// //             const callback = ipcMain.on.mock.calls[0][1];
// //             await callback(undefined, testNewLang);

// //             expect(i18n.changeLanguage).toHaveBeenCalledWith(testNewLang);
// //             expect(settings.set).toHaveBeenCalledWith(
// //               'appLanguage',
// //               testNewLang
// //             );
// //           });
// //         });

// //         describe('when ipcMain.on("get-signaling-server-port" callback was called', () => {
// //           describe('when main window is defined', () => {
// //             it('should send a signaling server port to main window', () => {
// //               testApp.mainWindow = ({
// //                 webContents: { send: jest.fn() },
// //               } as unknown) as BrowserWindow;

// //               testApp.initIpcMain();

// //               // @ts-ignore
// //               const callback = ipcMain.handle.mock.calls[0][1];
// //               callback();

// //               expect(testApp.mainWindow.webContents.send).toHaveBeenCalledWith(
// //                 'sending-port-from-main',
// //                 TEST_SIGNALING_SERVER_PORT
// //               );
// //             });
// //           });
// //         });

// //         describe('when ipcMain.on("get-all-displays" callback was called', () => {
// //           it('should return screen.getAllDisplays() result', () => {
// //             testApp.initIpcMain();

// //             // @ts-ignore
// //             const callback = ipcMain.handle.mock.calls[1][1];
// //             const res = callback();

// //             expect(res).toBe(TEST_SCREEN_GET_ALL_DISPLAYS_RESULT);
// //             expect(screen.getAllDisplays).toBeCalled();
// //           });
// //         });

// //         describe('when ipcMain.on("get-display-size-by-display-id" callback was called', () => {
// //           describe('when displayID exists in screen.getAllDisplays() result', () => {
// //             it('should return display size as expected', () => {
// //               testApp.initIpcMain();

// //               // @ts-ignore
// //               const callback = ipcMain.handle.mock.calls[2][1];
// //               const res = callback(undefined, TEST_DISPLAY_ID);

// //               expect(res).toEqual(TEST_DISPLAY_SIZE);
// //             });
// //           });

// //           describe('when displayID NOT exist in screen.getAllDisplays() result', () => {
// //             it('should return undefined expected', () => {
// //               testApp.initIpcMain();

// //               // @ts-ignore
// //               const callback = ipcMain.handle.mock.calls[2][1];
// //               const res = callback(undefined, 'dagaw22ds');

// //               expect(res).toBe(undefined);
// //             });
// //           });
// //         });

// //         describe('when ipcMain.on("main-window-onbeforeunload" callback was called', () => {
// //           it('should reset globals', () => {
// //             // @ts-ignore
// //             getDeskreenGlobal.mockReturnValue(mockGlobal);

// //             testApp.initIpcMain();

// //             // @ts-ignore
// //             const callback = ipcMain.handle.mock.calls[3][1];
// //             callback();

// //             const deskreenGlobal = getDeskreenGlobal();

// //             expect(deskreenGlobal.connectedDevicesService).not.toBe(
// //               TEST_CONNECTED_DEVICES_SERVICE
// //             );
// //             expect(deskreenGlobal.roomIDService).not.toBe(TEST_ROOM_ID_SERVICE);
// //             testMapSharingSessions.forEach((s) => {
// //               expect(s.denyConnectionForPartner).toBeCalled();
// //               expect(s.destroy).toBeCalled();
// //             });
// //             testMapHelpers.forEach((s) => {
// //               expect(s.close).toBeCalled();
// //             });

// //             expect(
// //               deskreenGlobal.sharingSessionService
// //                 .waitingForConnectionSharingSession
// //             ).toBe(null);
// //             expect(testMapHelpers.size).toBe(0);
// //             expect(testMapSharingSessions.size).toBe(0);
// //           });
// //         });

// //         describe('when createWindow is called', () => {
// //           describe('when in dev environment', () => {
// //             it('should call installExtensions', async () => {
// //               // @ts-ignore
// //               // installExtensions = jest.fn();
// //               const processEnvNodeEnvBackup = process.env.NODE_ENV;
// //               process.env.NODE_ENV = 'development';

// //               await testApp.createWindow();

// //               expect(installExtensions).toBeCalledTimes(1);

// //               process.env.NODE_ENV = processEnvNodeEnvBackup;

// //               const processDebugProdBackup = process.env.DEBUG_PROD;
// //               process.env.DEBUG_PROD = 'true';

// //               await testApp.createWindow();

// //               expect(installExtensions).toBeCalledTimes(2);

// //               process.env.DEBUG_PROD = processDebugProdBackup;
// //             });
// //           });

// //           describe('when mainWindow is created', () => {
// //             it('should call .mainWindow.loadURL with proper parameter', () => {
// //               testApp.createWindow();

// //               expect(testApp.mainWindow?.loadURL).toHaveBeenCalledWith(
// //                 `file://${__dirname}/app.html`
// //               );
// //             });

// //             it('should set .mainWindow.webContents.on("did-finish-load"', () => {
// //               testApp.createWindow();

// //               expect(testApp.mainWindow?.webContents.on).toHaveBeenCalledWith(
// //                 'did-finish-load',
// //                 expect.anything()
// //               );
// //             });

// //             describe('when process.env.NODE_ENV === "dev"', () => {
// //               it('should call this.mainWindow.webContents.toggleDevTools', () => {
// //                 const backProcEnvNodeEnv = process.env.NODE_ENV;
// //                 process.env.NODE_ENV = 'dev';

// //                 testApp.createWindow();

// //                 expect(
// //                   testApp.mainWindow?.webContents.toggleDevTools
// //                 ).toBeCalled();

// //                 process.env.NODE_ENV = backProcEnvNodeEnv;
// //               });
// //             });

// //             describe('when .mainWindow?.webContents.on("did-finish-load" callback called', () => {
// //               describe('when mainWindow is not defined', () => {
// //                 it('should throw an error', () => {
// //                   testApp.createWindow();

// //                   const callback =
// //                     // @ts-ignore
// //                     testApp.mainWindow.webContents.on.mock.calls[0][1];

// //                   testApp.mainWindow = null;

// //                   try {
// //                     callback();
// //                     // eslint-disable-next-line jest/no-jasmine-globals
// //                     fail();
// //                   } catch (e) {
// //                     // eslint-disable-next-line jest/no-try-expect
// //                     expect(e).toEqual(new Error('"mainWindow" is not defined'));
// //                   }
// //                 });
// //               });

// //               describe('when process.env.START_MINIMIZED is defined', () => {
// //                 it('should call mainWindow.minimize', () => {
// //                   testApp.createWindow();
// //                   const backProcessEnvStartMinimized =
// //                     process.env.START_MINIMIZED;
// //                   process.env.START_MINIMIZED = 'true';

// //                   const callback =
// //                     // @ts-ignore
// //                     testApp.mainWindow.webContents.on.mock.calls[0][1];

// //                   callback();

// //                   expect(testApp.mainWindow?.minimize).toBeCalled();

// //                   process.env.START_MINIMIZED = backProcessEnvStartMinimized;
// //                 });
// //               });

// //               describe('when process.env.START_MINIMIZED is NOT defined', () => {
// //                 it('should call mainWindow.show and mainWindow.focus', () => {
// //                   testApp.createWindow();
// //                   const backProcessEnvStartMinimized =
// //                     process.env.START_MINIMIZED;
// //                   process.env.START_MINIMIZED = 'false';

// //                   const callback =
// //                     // @ts-ignore
// //                     testApp.mainWindow.webContents.on.mock.calls[0][1];

// //                   callback();

// //                   expect(testApp.mainWindow?.show).toBeCalled();
// //                   expect(testApp.mainWindow?.focus).toBeCalled();

// //                   process.env.START_MINIMIZED = backProcessEnvStartMinimized;
// //                 });
// //               });
// //             });

// //             describe('when .mainWindow?.on("closed" callback called', () => {
// //               it('should set main window to null', () => {
// //                 testApp.createWindow();
// //                 const callback =
// //                   // @ts-ignore
// //                   testApp.mainWindow.on.mock.calls[0][1];

// //                 callback();

// //                 expect(testApp.mainWindow).toBeNull();
// //               });
// //               describe('when process.platform !== "darwin"', () => {
// //                 it('should call app.quit()', () => {
// //                   const processBackup = process;
// //                   // @ts-ignore
// //                   // eslint-disable-next-line no-global-assign
// //                   process = {
// //                     ...processBackup,
// //                     platform: 'linux',
// //                   };
// //                   testApp.createWindow();

// //                   const callback =
// //                     // @ts-ignore
// //                     testApp.mainWindow.on.mock.calls[0][1];

// //                   callback();

// //                   expect(app.quit).toBeCalled();

// //                   // @ts-ignore
// //                   // eslint-disable-next-line no-global-assign
// //                   process = processBackup;
// //                 });
// //               });

// //               describe('when process.platform === "darwin"', () => {
// //                 it('should call app.quit()', () => {
// //                   const processBackup = process;
// //                   // @ts-ignore
// //                   // eslint-disable-next-line no-global-assign
// //                   process = {
// //                     ...processBackup,
// //                     platform: 'darwin',
// //                   };
// //                   testApp.createWindow();

// //                   const callback =
// //                     // @ts-ignore
// //                     testApp.mainWindow.on.mock.calls[0][1];

// //                   callback();

// //                   expect(app.quit).not.toBeCalled();

// //                   // @ts-ignore
// //                   // eslint-disable-next-line no-global-assign
// //                   process = processBackup;
// //                 });
// //               });
// //             });
// //           });
// //         });
// //       });

// //       describe('when process.env.NODE_ENV === "production"', () => {
// //         it('should call sourceMapSupport to be called when ', () => {
// //           const envNodeEnvBackup = process.env.NODE_ENV;
// //           process.env.NODE_ENV = 'production';

// //           testApp.start();

// //           expect(sourceMapSupport.install).toBeCalled();

// //           process.env.NODE_ENV = envNodeEnvBackup;
// //         });
// //       });

// //       describe('when process.env.NODE_ENV === "development"', () => {
// //         it('should call electron-debug ', () => {
// //           const envNodeEnvBackup = process.env.NODE_ENV;
// //           process.env.NODE_ENV = 'development';

// //           testApp.start();

// //           expect(electronDebug).toBeCalled();

// //           process.env.NODE_ENV = envNodeEnvBackup;
// //         });
// //       });

// //       describe('when process.env.DEBUG_PROD === "true"', () => {
// //         it('should call electron-debug ', () => {
// //           const envDebugProdBackup = process.env.DEBUG_PROD;
// //           process.env.DEBUG_PROD = 'true';

// //           testApp.start();

// //           expect(electronDebug).toBeCalled();

// //           process.env.DEBUG_PROD = envDebugProdBackup;
// //         });
// //       });
// //     });

// //     describe('when .initI18n() was called', () => {
// //       it('should init i18n object with .on("loaded" event', () => {
// //         testApp.initI18n();

// //         expect(i18n.on).toBeCalledWith('loaded', expect.anything());
// //       });

// //       it('should init i18n object with .on("languageChanged" event', () => {
// //         testApp.initI18n();

// //         expect(i18n.on).toBeCalledWith('languageChanged', expect.anything());
// //       });

// //       describe('when "loaded" event occured', () => {
// //         it('should call changleLanguage("en") and i18n.off("loaded"', () => {
// //           testApp.initI18n();
// //           // @ts-ignore
// //           const callback = i18n.on.mock.calls[0][1];

// //           callback();

// //           expect(i18n.changeLanguage).toBeCalledWith('en');
// //           expect(i18n.off).toBeCalledWith('loaded');
// //         });
// //       });

// //       describe('when "languageChanged" event occured', () => {
// //         describe('when mainWindow is defined', () => {
// //           it('should create new MenuBuilder', () => {
// //             testApp.mainWindow = ({} as unknown) as BrowserWindow;
// //             testApp.initI18n();
// //             // @ts-ignore
// //             const callback = i18n.on.mock.calls[1][1];

// //             callback();

// //             expect(MenuBuilder).toHaveBeenCalledTimes(1);
// //             expect(MenuBuilder).toHaveBeenCalledWith(testApp.mainWindow, i18n);
// //           });

// //           it('should call .buildMenu() of menuBuilder', () => {
// //             testApp.mainWindow = ({} as unknown) as BrowserWindow;
// //             testApp.initI18n();
// //             // @ts-ignore
// //             const callback = i18n.on.mock.calls[1][1];

// //             callback();

// //             // @ts-ignore
// //             const mockMenuBuilderInstance = MenuBuilder.mock.instances[0];

// //             expect(mockMenuBuilderInstance.buildMenu).toBeCalled();
// //           });

// //           it('should call setTimeout with callback and delay', () => {
// //             testApp.mainWindow = ({} as unknown) as BrowserWindow;
// //             testApp.initI18n();
// //             // @ts-ignore
// //             const callback = i18n.on.mock.calls[1][1];

// //             callback();

// //             expect(setTimeout).toHaveBeenCalledWith(expect.anything(), 400);
// //           });

// //           describe('when setTimeout callback triggered after delay', () => {
// //             describe('when should really change app lang', () => {
// //               it('should call i18n.changeLanguage with passed language', () => {
// //                 const testLng = 'bg';
// //                 testApp.mainWindow = ({} as unknown) as BrowserWindow;
// //                 testApp.initI18n();
// //                 // @ts-ignore
// //                 const callback = i18n.on.mock.calls[1][1];
// //                 callback(testLng);
// //                 // @ts-ignore
// //                 const timeoutCallback = setTimeout.mock.calls[0][0];

// //                 timeoutCallback();

// //                 expect(i18n.changeLanguage).toHaveBeenCalledWith(testLng);
// //               });

// //               it('should set "appLanguage" in electron-settings', async () => {
// //                 const testLng = 'bg';
// //                 testApp.mainWindow = ({} as unknown) as BrowserWindow;
// //                 testApp.initI18n();
// //                 // @ts-ignore
// //                 const callback = i18n.on.mock.calls[1][1];
// //                 callback(testLng);
// //                 // @ts-ignore
// //                 const timeoutCallback = setTimeout.mock.calls[0][0];

// //                 await timeoutCallback();

// //                 expect(settings.set).toHaveBeenCalledWith(
// //                   'appLanguage',
// //                   testLng
// //                 );
// //               });
// //             });
// //           });
// //         });
// //       });
// //     });
// //   });

// //   describe('when installExtensions was called', () => {
// //     it('should call electron-devtools-installer with "REACT_DEVELOPER_TOOLS" and "REDUX_DEVTOOLS"', async () => {
// //       // @ts-ignore
// //       installExtensions.mockImplementation(
// //         jest.requireActual('./utils/installExtensions').default
// //       );

// //       await installExtensions();

// //       expect(electronDevToolsInstaller.default).toBeCalledWith(
// //         'REDUX_DEVTOOLS',
// //         !!process.env.UPGRADE_EXTENSIONS
// //       );
// //       expect(electronDevToolsInstaller.default).toBeCalledWith(
// //         'REACT_DEVELOPER_TOOLS',
// //         !!process.env.UPGRADE_EXTENSIONS
// //       );
// //     });
// //   });
// // });
