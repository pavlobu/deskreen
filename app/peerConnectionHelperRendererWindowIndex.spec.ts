import { ipcRenderer } from 'electron';
import PeerConnection from './features/PeerConnection';
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { handleIpcRenderer } from './peerConnectionHelperRendererWindowIndex';

jest.useFakeTimers();

jest.mock('electron', () => {
  return {
    ipcRenderer: {
      on: jest.fn(),
      send: jest.fn(),
    },
    remote: {
      getGlobal: jest.fn(),
    },
  };
});
jest.mock('simple-peer');
jest.mock('./features/PeerConnection');

describe('peerConnectionHelperRendererWindowIndex tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    // @ts-ignore
    PeerConnection.mockClear();
  });

  function mockAndGetPeerConnectionInstance() {
    handleIpcRenderer();
    // @ts-ignore
    let callback = ipcRenderer.on.mock.calls[0][1];
    // @ts-ignore
    ipcRenderer.on.mockClear();
    callback();
    // @ts-ignore
    // eslint-disable-next-line prefer-destructuring
    callback = ipcRenderer.on.mock.calls[0][1];

    callback(undefined, {
      roomId: '12',
      sharingSessionID: '39392',
      user: 'asd',
      appTheme: true,
      appLanguage: 'bz',
    });
    // @ts-ignore
    return PeerConnection.mock.instances[0];
  }

  describe('when handleIpcRenderer was called', () => {
    it('should set ipcRenderer.on("start-peer-connection" listener', () => {
      handleIpcRenderer();

      expect(ipcRenderer.on).toHaveBeenCalledWith(
        'start-peer-connection',
        expect.anything()
      );
    });

    describe('when ipcRenderer.on("start-peer-connection" callback occurred', () => {
      it('should set ipcRenderer.on("create-peer-connection-with-data"', () => {
        handleIpcRenderer();

        // @ts-ignore
        const callback = ipcRenderer.on.mock.calls[0][1];
        // @ts-ignore
        ipcRenderer.on.mockClear();

        callback();

        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'create-peer-connection-with-data',
          expect.anything()
        );
      });

      it('should set ipcRenderer listeners', () => {
        handleIpcRenderer();

        // @ts-ignore
        const callback = ipcRenderer.on.mock.calls[0][1];
        // @ts-ignore
        ipcRenderer.on.mockClear();

        callback();

        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'create-peer-connection-with-data',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'create-peer-connection-with-data',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'set-desktop-capturer-source-id',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'call-peer',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'disconnect-by-host-machine-user',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'deny-connection-for-partner',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'send-user-allowed-to-connect',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'app-color-theme-changed',
          expect.anything()
        );
        expect(ipcRenderer.on).toHaveBeenCalledWith(
          'app-language-changed',
          expect.anything()
        );
      });

      describe('when ipcRenderer.on("create-peer-connection-with-data" callback occurred', () => {
        it('should initialize PeerConnection', () => {
          handleIpcRenderer();
          // @ts-ignore
          let callback = ipcRenderer.on.mock.calls[0][1];
          // @ts-ignore
          ipcRenderer.on.mockClear();
          callback();
          // @ts-ignore
          // eslint-disable-next-line prefer-destructuring
          callback = ipcRenderer.on.mock.calls[0][1];

          callback(undefined, {
            roomId: '12',
            sharingSessionID: '39392',
            user: 'asd',
            appTheme: true,
            appLanguage: 'bz',
          });

          expect(PeerConnection).toHaveBeenCalled();
          // @ts-ignore
          const peerConnectionInstance = PeerConnection.mock.instances[0];
          expect(
            peerConnectionInstance.setOnDeviceConnectedCallback
          ).toBeCalled();
        });

        describe('when on device connected callback occurred', () => {
          it('should call ipcRenderer.send("peer-connected" with device data', () => {
            const peerConnectionInstance = mockAndGetPeerConnectionInstance();
            // eslint-disable-next-line prefer-destructuring
            const callback =
              // @ts-ignore
              peerConnectionInstance.setOnDeviceConnectedCallback.mock
                .calls[0][0];
            const testDeviceData = 'asd23faga';

            callback(testDeviceData);

            expect(ipcRenderer.send).toHaveBeenCalledWith(
              'peer-connected',
              testDeviceData
            );
          });
        });
      });

      describe('when ipcRenderer.on("set-desktop-capturer-source-id" callback occurred', () => {
        it('should call peerConnection.setDesktopCapturerSourceID(id) with proper source id', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const setDesktopCapturerSourceIdCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[1][1];
          const testSourceID = '12411';

          setDesktopCapturerSourceIdCallback(undefined, testSourceID);

          expect(
            peerConnectionInstance.setDesktopCapturerSourceID
          ).toHaveBeenCalledWith(testSourceID);
        });
      });

      describe('when ipcRenderer.on("call-peer" callback occurred', () => {
        it('should call peerConnection.callPeer()', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const callPeerCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[2][1];

          callPeerCallback();

          expect(peerConnectionInstance.callPeer).toHaveBeenCalled();
        });
      });

      describe('when ipcRenderer.on("disconnect-by-host-machine-user" callback occurred', () => {
        it('should call peerConnection.disconnectByHostMachineUser()', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const disconnectCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[3][1];

          disconnectCallback();

          expect(
            peerConnectionInstance.disconnectByHostMachineUser
          ).toHaveBeenCalled();
        });
      });

      describe('when ipcRenderer.on("deny-connection-for-partner" callback occurred', () => {
        it('should call peerConnection.denyConnectionForPartner()', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const denyConnectionCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[4][1];

          denyConnectionCallback();

          expect(
            peerConnectionInstance.denyConnectionForPartner
          ).toHaveBeenCalled();
        });
      });

      describe('when ipcRenderer.on("send-user-allowed-to-connect" callback occurred', () => {
        it('should call peerConnection.sendUserAllowedToConnect()', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const sendUserAllowedToConnectCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[5][1];

          sendUserAllowedToConnectCallback();

          expect(
            peerConnectionInstance.sendUserAllowedToConnect
          ).toHaveBeenCalled();
        });
      });

      describe('when ipcRenderer.on("app-color-theme-changed" callback occurred', () => {
        it('should call peerConnection.setAppTheme(newTheme)', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const setAppThemeCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[6][1];
          const testTheme = true;

          setAppThemeCallback(undefined, testTheme);

          expect(peerConnectionInstance.setAppTheme).toHaveBeenCalledWith(
            testTheme
          );
        });
      });

      describe('when ipcRenderer.on("app-language-changed" callback occurred', () => {
        it('should call peerConnection.testAppLang(newLang)', () => {
          const peerConnectionInstance = mockAndGetPeerConnectionInstance();

          const setAppLangCallback =
            // @ts-ignore
            ipcRenderer.on.mock.calls[7][1];
          const testAppLang = 'eu';

          setAppLangCallback(undefined, testAppLang);

          expect(peerConnectionInstance.setAppLanguage).toHaveBeenCalledWith(
            testAppLang
          );
        });
      });
    });
  });
});
