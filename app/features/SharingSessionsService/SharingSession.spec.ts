/* eslint-disable @typescript-eslint/ban-ts-comment */
import SharingSession from './SharingSession';
import SharingSessionStatusEnum from './SharingSessionStatusEnum';
import SharingType from './SharingTypeEnum';

jest.useFakeTimers();

describe('SharingSession unit tests', () => {
  let sharingSession: SharingSession;

  beforeEach(() => {
    sharingSession = new SharingSession(
      '1234',
      {
        username: '',
        privateKey: '',
        publicKey: '',
      },
      {
        // @ts-ignore: fine here
        createPeerConnectionHelperRenderer: () => {
          return {
            webContents: {
              on: () => {},
              toggleDevTools: () => {},
            },
          };
        },
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    it('should create new SharingSession with statusChangeListeners.length to be 0', () => {
      expect(sharingSession.statusChangeListeners.length).toBe(0);
    });
  });

  describe('when addStatusChangeListener is called', () => {
    it('should have statusChangeListeners.length of 1', () => {
      sharingSession.addStatusChangeListener(() => {});

      expect(sharingSession.statusChangeListeners.length).toBe(1);
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
});
