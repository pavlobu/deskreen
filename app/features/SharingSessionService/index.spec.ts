import SharingSessionStatusEnum from './SharingSessionStatusEnum';
import SharingSession from './SharingSession';
import SharingSessionService from '.';
import RoomIDService from '../../server/RoomIDService';
import ConnectedDevicesService from '../ConnectedDevicesService';
import PeerConnectionHelperRendererService from '../PeerConnectionHelperRendererService';

// this may look as an ugly mock, but hey, this works! and don't forget that it is a unit test
// why do we make it like that ? because jest doesn't allow ex.
// duplicated __mock__/electron in different subfolders of the project, so.. better do manual mock in a test file itself
// jest bug reference on duplicated mocks found: https://github.com/facebook/jest/issues/2070
// it is a bad design of jest itself by default, so this is the best workaround, simply by making manual mock in this way:
jest.mock('../PeerConnectionHelperRendererService', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createPeerConnectionHelper: () => {
        return {
          webContents: {
            on: () => {},
            toggleDevTools: () => {},
          },
        };
      },
    };
  });
});

jest.useFakeTimers();

describe('SharingSessionService unit tests', () => {
  let sharingSessionService: SharingSessionService;

  beforeEach(() => {
    sharingSessionService = new SharingSessionService(
      new RoomIDService(),
      new ConnectedDevicesService(),
      new PeerConnectionHelperRendererService('')
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when new SharingSessionService() is created', () => {
    it('should have empty sharingSessions Map', () => {
      expect(sharingSessionService.sharingSessions.size).toBe(0);
    });

    it('should have waitingForConnectionSharingSession set to null', () => {
      expect(sharingSessionService.waitingForConnectionSharingSession).toBe(
        null
      );
    });

    it('should have pollForInactiveSessions be called', () => {
      const backup = SharingSessionService.prototype.pollForInactiveSessions;

      const mockPollForInactiveSessions = jest.fn();
      jest
        .spyOn(SharingSessionService.prototype, 'pollForInactiveSessions')
        .mockImplementation(mockPollForInactiveSessions);

      // eslint-disable-next-line no-new
      new SharingSessionService(
        new RoomIDService(),
        new ConnectedDevicesService(),
        new PeerConnectionHelperRendererService('')
      );

      jest.advanceTimersByTime(1000 * 60 * 60 * 30); // thirty hours later

      expect(mockPollForInactiveSessions).toBeCalled();

      SharingSessionService.prototype.pollForInactiveSessions = backup;
    });
  });

  describe('when createNewSharingSession is called', () => {
    it('should have sharingSessions Map with size equal to 1', async () => {
      await sharingSessionService.createNewSharingSession('');

      expect(sharingSessionService.sharingSessions.size).toBe(1);
    });

    it('should have returned SharingSession object', async () => {
      expect(
        await sharingSessionService.createNewSharingSession('')
      ).toBeInstanceOf(SharingSession);
    });
  });

  describe('when pollForInactiveSessions is called', () => {
    it('should have removed SharingSession with status ERROR from sharingSessions Map', async () => {
      const testSharingSession = await sharingSessionService.createNewSharingSession(
        ''
      );
      testSharingSession.status = SharingSessionStatusEnum.ERROR;

      sharingSessionService.pollForInactiveSessions();

      expect(sharingSessionService.sharingSessions.size).toBe(0);
    });
  });

  describe('when createWaitingForConnectionSharingSession is called', () => {
    it('should call waitWhileUserIsNotCreated', async () => {
      sharingSessionService.waitWhileUserIsNotCreated = jest
        .fn()
        .mockImplementation(() => {
          return new Promise((resolve) => resolve(undefined));
        });

      await sharingSessionService.createWaitingForConnectionSharingSession('');

      expect(sharingSessionService.waitWhileUserIsNotCreated).toBeCalled();
    });

    describe('when user created', () => {
      it('should call createNewSharingSession with roomID', async () => {
        const testRoomID = '12342341';
        sharingSessionService.waitWhileUserIsNotCreated = jest
          .fn()
          .mockImplementation(() => {
            return new Promise((resolve) => resolve(undefined));
          });
        sharingSessionService.createNewSharingSession = jest.fn();

        await sharingSessionService.createWaitingForConnectionSharingSession(
          testRoomID
        );

        expect(sharingSessionService.createNewSharingSession).toBeCalledWith(
          testRoomID
        );
      });

      it('should resolve with waitingForConnectionSharingSession', async () => {
        const testSharingSession = new Promise<SharingSession>((resolve) =>
          resolve(({ ab: 'ba' } as unknown) as SharingSession)
        );
        sharingSessionService.waitWhileUserIsNotCreated = jest
          .fn()
          .mockImplementation(() => {
            return new Promise((resolve) => resolve(undefined));
          });
        sharingSessionService.createNewSharingSession = () =>
          testSharingSession;

        const res = await sharingSessionService.createWaitingForConnectionSharingSession(
          '234'
        );

        expect(res).toBe(await testSharingSession);
      });
    });
  });

  describe('when waitWhileUserIsNotCreated is called', () => {
    it('should wait until user is created then call clearInterval', () => {
      const testUser = {
        username: 'string',
        privateKey: 'string',
        publicKey: 'string',
      };
      sharingSessionService.waitWhileUserIsNotCreated();

      expect(setInterval).toHaveBeenCalledTimes(2);
      expect(clearInterval).toHaveBeenCalledTimes(0);

      sharingSessionService.user = testUser;

      jest.advanceTimersByTime(10000);

      expect(setInterval).toHaveBeenCalledTimes(2);
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });
  });
});
