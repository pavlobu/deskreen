/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import { BrowserWindow } from 'electron';
import PeerConnectionHelperRendererService from '.';

jest.useFakeTimers();

jest.mock('electron', () => {
  return {
    BrowserWindow: jest.fn().mockImplementation(() => {
      return {
        loadURL: jest.fn(),
        webContents: {
          on: jest.fn(),
          send: jest.fn(),
          toggleDevTools: jest.fn(),
        },
        on: jest.fn(),
      };
    }),
  };
});

const testAppPath = '/a/b/c/deskreen_app';
const testBrowserWindowParams = {
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
          contextIsolation: true,
          nodeIntegration: true,
          enableRemoteModule: true,
        }
      : {
          preload: path.join(
            testAppPath,
            'dist/peerConnectionHelperRendererWindow.renderer.prod.js'
          ),
          enableRemoteModule: true,
        },
};

describe('PeerConnectionHelperRendererService tests', () => {
  let service: PeerConnectionHelperRendererService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    service = new PeerConnectionHelperRendererService(testAppPath);
  });

  describe('when PeerConnectionHelperRendererService created properly', () => {
    it('should set appPath to what was passed to constructor', () => {
      expect(service.appPath).toEqual(testAppPath);
    });

    describe('when createPeerConnectionHelperRenderer was called', () => {
      it('should call new BrowserWindow from electron', () => {
        service.createPeerConnectionHelperRenderer();

        expect(BrowserWindow).toHaveBeenCalledTimes(1);
        expect(BrowserWindow).toHaveBeenCalledWith(testBrowserWindowParams);
      });

      describe('when process.env.NODE_ENV === dev', () => {
        it('should open developer tools', () => {
          const prevNodeEnv = process.env.NODE_ENV;
          process.env.NODE_ENV = 'dev';
          const window = service.createPeerConnectionHelperRenderer();

          expect(window.webContents.toggleDevTools).toBeCalled();

          process.env.NODE_ENV = prevNodeEnv;
        });
      });

      describe('when .on(did-finish-load callback executed', () => {
        it('should call .webContents.send with start-peer-connection', () => {
          const window = service.createPeerConnectionHelperRenderer();

          // @ts-ignore
          const callback = window.webContents.on.mock.calls[0][1]; // get .on('did-finish-load' mock call
          callback();

          expect(window.webContents.send).toBeCalledWith(
            'start-peer-connection'
          );
        });
      });
    });
  });
});
