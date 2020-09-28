import SharingSessionService from '.';
import SharingType from './SharingType';

jest.useFakeTimers();

describe('SharingSession unit tests', () => {
  let sharingSession: SharingSessionService;

  beforeEach(() => {
    sharingSession = new SharingSessionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when new SahringSession() is called', () => {
    it('should create sharing session with id', () => {
      expect(sharingSession.id).toBeTruthy();
    });

    it('should crete sharing session with deviceID equal to "" ', () => {
      expect(sharingSession.deviceID).toBe('');
    });

    it('should create sharing session with sharingType equal to NOT_SET', () => {
      expect(sharingSession.sharingType).toBe(SharingType.NOT_SET);
    });

    it('should create sharing session with sharingStream set to null', () => {
      expect(sharingSession.sharingStream).toBe(null);
    });
  });
});
