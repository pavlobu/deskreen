/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import SharingSession from './SharingSession';
import SharingSessionStatusEnum from './SharingSessionStatusEnum';
import SharingType from './SharingTypeEnum';

jest.useFakeTimers();

const testAppLang = 'ua';
const testAppTheme = true;
const testUser = {
  username: '',
  privateKey: '',
  publicKey: '',
};

describe('SharingSession unit tests', () => {
  let sharingSession: SharingSession;

  beforeEach(() => {
    process.env.RUN_MODE = 'test-jest';
    sharingSession = new SharingSession(
      '1234',
      testUser,
      {
        // @ts-ignore: fine here
        createPeerConnectionHelperRenderer: () => {
          return {
            webContents: {
              on: jest.fn(),
              send: jest.fn(),
            },
            close: jest.fn(),
          };
        },
      },
      testAppLang,
      testAppTheme
    );
  });

  afterEach(() => {
    process.env.RUN_MODE = 'test';
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when new SahringSession() is created', () => {
    it('should create new SharingSession with id', () => {
      expect(sharingSession.id).toBeTruthy();
    });

    it('should crete new SharingSession with deviceID equal to "" ', () => {
      expect(sharingSession.deviceID).toBe('');
    });

    it('should create new SharingSession with sharingType equal to NOT_SET', () => {
      expect(sharingSession.sharingType).toBe(SharingType.NOT_SET);
    });

    it('should create new SharingSession with sharingStream set to null', () => {
      expect(sharingSession.sharingStream).toBe(null);
    });

    it('should create new SharingSession with roomID', () => {
      expect(sharingSession.roomID).toBeTruthy();
    });

    it('should create new SharingSession with connectedDeviceAt set to null', () => {
      expect(sharingSession.connectedDeviceAt).toBe(null);
    });

    it('should create new SharingSession with sharingStartedAt set to null', () => {
      expect(sharingSession.sharingStartedAt).toBe(null);
    });

    it('should create new SharingSession with status set to NOT_CONNECTED', () => {
      expect(sharingSession.status).toBe(
        SharingSessionStatusEnum.NOT_CONNECTED
      );
    });

    it('should create new SharingSession with statusChangeListeners.length to be 1', () => {
      expect(sharingSession.statusChangeListeners.length).toBe(1);
    });

    describe('when .peerConnectionHelperRenderer.webContents.on(did-finish-load event occurred', () => {
      it('should call .peerConnectionHelperRenderer?.webContents.send( with proper parameters', () => {
        const callback =
          // @ts-ignore
          sharingSession.peerConnectionHelperRenderer?.webContents.on.mock
            .calls[0][1];

        callback();

        expect(
          sharingSession.peerConnectionHelperRenderer?.webContents.send
        ).toBeCalledWith('create-peer-connection-with-data', {
          roomID: sharingSession.roomID,
          sharingSessionID: sharingSession.id,
          user: testUser,
          appTheme: testAppTheme,
          appLanguage: testAppLang,
        });
      });
    });

    describe('when .peerConnectionHelperRenderer.webContents.on("ipc-message" event occurred on "peer-connected" channel and when onDeviceConnectedCallback is defined', () => {
      it('should call .onDeviceConnectedCallback(data) with proper data', () => {
        const testData = 'alsi33i223';
        const testCallback = jest.fn();
        const callback =
          // @ts-ignore
          sharingSession.peerConnectionHelperRenderer?.webContents.on.mock
            .calls[1][1];
        sharingSession.onDeviceConnectedCallback = testCallback;

        callback(undefined, 'peer-connected', testData);

        expect(testCallback).toBeCalledWith(testData);
      });
    });

    describe('when .peerConnectionHelperRenderer.webContents.on("ipc-message" event occurred NOT on "peer-connected" channel or when .onDeviceConnectedCallback is UNdefined', () => {
      it('should call .onDeviceConnectedCallback()', () => {
        const testData = 'alsi33i223';
        const testCallback = jest.fn();
        const callback =
          // @ts-ignore
          sharingSession.peerConnectionHelperRenderer?.webContents.on.mock
            .calls[1][1];
        sharingSession.onDeviceConnectedCallback = testCallback;

        callback(undefined, 'random-channel!!', testData);
        expect(testCallback).not.toBeCalled();

        sharingSession.onDeviceConnectedCallback = undefined;
        callback(undefined, 'peer-connected', testData);

        expect(testCallback).not.toBeCalled();
      });
    });
  });

  describe('when addStatusChangeListener is called', () => {
    it('should have statusChangeListeners.length of 1', () => {
      sharingSession.addStatusChangeListener(() => {});

      expect(sharingSession.statusChangeListeners.length).toBe(2);
    });
  });

  describe('when notifyStatusChangeListeners is called', () => {
    it('should invoke all statusChangeListeners', async () => {
      const mockStatusChangeListener1 = jest.fn();
      const mockStatusChangeListener2 = jest.fn();
      sharingSession.addStatusChangeListener(mockStatusChangeListener1);
      sharingSession.addStatusChangeListener(mockStatusChangeListener2);

      await sharingSession.notifyStatusChangeListeners();

      expect(mockStatusChangeListener1).toBeCalled();
      expect(mockStatusChangeListener2).toBeCalled();
    });
  });

  describe('when setStatus is called', () => {
    it('should invoke notifyStatusChangeListeners', async () => {
      const mockNotifyStatusChangeListeners = jest.fn();
      sharingSession.notifyStatusChangeListeners = mockNotifyStatusChangeListeners;

      sharingSession.setStatus(SharingSessionStatusEnum.CONNECTED);

      expect(mockNotifyStatusChangeListeners).toBeCalled();
    });
  });

  describe('when updateStatus is called with SharingSessionStatus argument', () => {
    it('should set SharingSession.status as passed in updateStatus argument', async () => {
      sharingSession.setStatus(SharingSessionStatusEnum.CONNECTED);

      expect(sharingSession.status).toBe(SharingSessionStatusEnum.CONNECTED);

      sharingSession.setStatus(SharingSessionStatusEnum.SHARING);

      expect(sharingSession.status).toBe(SharingSessionStatusEnum.SHARING);
    });
  });

  describe('when setDeviceID is called with deviceID argument', () => {
    it('should set SharingSession.deviceID as in setDeviceID passed argument', async () => {
      const testDeviceID = '8989';
      sharingSession.setDeviceID(testDeviceID);

      expect(sharingSession.deviceID).toBe(testDeviceID);
    });
  });

  describe('when destroy() is called', () => {
    it('should call peerConnectionHelperRenderer.close()', () => {
      sharingSession.destroy();

      expect(sharingSession.peerConnectionHelperRenderer?.close).toBeCalled();
    });
  });

  describe('when setOnDeviceConnectedCallback() is called', () => {
    it('should set a .onDeviceConnectedCallback same as passed in parameter', () => {
      const testCallback = (_: Device) => {};
      sharingSession.setOnDeviceConnectedCallback(testCallback);

      expect(sharingSession.onDeviceConnectedCallback).toBe(testCallback);
    });
  });

  describe('when setDesktopCapturerSourceID() is called', () => {
    it('should set a .desktopCapturerSourceID and call .webContents.send with proper parameters', () => {
      const testID = '2o20d';

      sharingSession.setDesktopCapturerSourceID(testID);

      expect(sharingSession.desktopCapturerSourceID).toEqual(testID);
      expect(
        sharingSession.peerConnectionHelperRenderer?.webContents.send
      ).toBeCalledWith('set-desktop-capturer-source-id', testID);
    });
  });

  describe('when callPeer() is called', () => {
    it('should call .webContents.send with proper event name', () => {
      sharingSession.callPeer();

      expect(
        sharingSession.peerConnectionHelperRenderer?.webContents.send
      ).toBeCalledWith('call-peer');
    });
  });

  describe('when disconnectByHostMachineUser() is called', () => {
    it('should call .webContents.send with proper event name', () => {
      sharingSession.disconnectByHostMachineUser();

      expect(
        sharingSession.peerConnectionHelperRenderer?.webContents.send
      ).toBeCalledWith('disconnect-by-host-machine-user');
    });
  });

  describe('when denyConnectionForPartner() is called', () => {
    it('should call .webContents.send with proper event name', () => {
      sharingSession.denyConnectionForPartner();

      expect(
        sharingSession.peerConnectionHelperRenderer?.webContents.send
      ).toBeCalledWith('deny-connection-for-partner');
    });
  });

  describe('when appLanguageChanged() is called', () => {
    it('should call .webContents.send with proper event name', () => {
      const testLang = 'ua';

      sharingSession.appLanguageChanged(testLang);

      expect(
        sharingSession.peerConnectionHelperRenderer?.webContents.send
      ).toBeCalledWith('app-language-changed', testLang);
    });
  });

  describe('when appThemeChanged() is called', () => {
    it('should call .webContents.send with proper event name', () => {
      const testTheme = true;

      sharingSession.appThemeChanged(testTheme);

      expect(
        sharingSession.peerConnectionHelperRenderer?.webContents.send
      ).toBeCalledWith('app-color-theme-changed', testTheme);
    });
  });
});
