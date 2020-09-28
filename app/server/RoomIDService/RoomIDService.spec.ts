import RoomIDService from '.';

jest.useFakeTimers();

describe('SharingSessionService unit tests', () => {
  let roomIDService: RoomIDService;

  beforeEach(() => {
    roomIDService = new RoomIDService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when new RoomIDService() is created', () => {
    it('should have empty takenRoomIDs Set', () => {
      expect(roomIDService.takenRoomIDs.size).toBe(0);
    });
  });

  describe('when getShortIDStringOfAvailableRoom() is called', () => {
    it('should resolve with non empty string', async () => {
      const gotShortStringID = await roomIDService.getShortIDStringOfAvailableRoom();
      expect(gotShortStringID).toBeTruthy();
    });
  });

  describe('when getSimpleAvailableRoomID() is called', () => {
    it('should resolve with non empty string of nextAvailableRoomIDNumber property', async () => {
      const gotRoomID = await roomIDService.getSimpleAvailableRoomID();
      expect(gotRoomID).not.toBe('');
    });
  });

  describe('when markRoomIDAsTaken(id: string) is called', () => {
    it('should add passed id: string argument to takenRoomIDs Set', () => {
      const testRoomID = '1';
      roomIDService.markRoomIDAsTaken(testRoomID);

      expect(roomIDService.takenRoomIDs.has(testRoomID)).toBe(true);
    });
  });

  describe('when unmarkRoomIDAsTaken(id: string) is called', () => {
    it('should remove passed id: string argument to takenRoomIDs Set', () => {
      const testRoomID = '1';
      roomIDService.markRoomIDAsTaken(testRoomID);

      roomIDService.unmarkRoomIDAsTaken(testRoomID);

      expect(roomIDService.takenRoomIDs.has(testRoomID)).toBe(false);
    });
  });
});
