/* eslint-disable class-methods-use-this */
const shortID = require('shortid');

class RoomIDService {
  private static instance: RoomIDService;

  private nextAvailableRoomIDNumber: number;

  private takenRoomIDs: Set<string>;

  constructor() {
    this.takenRoomIDs = new Set<string>();
    // TODO: load saved taken room ids from local storage, will be useful for saved devices feature in FUTURE
    this.nextAvailableRoomIDNumber = 1;
  }

  public getSimpleAvailableRoomID(): string {
    while (this.takenRoomIDs.has(`${this.nextAvailableRoomIDNumber}`)) {
      this.nextAvailableRoomIDNumber += 1;
    }
    return `${this.nextAvailableRoomIDNumber}`;
  }

  public getShortIDStringOfAvailableRoom(): string {
    let newID = shortID();
    while (this.takenRoomIDs.has(newID)) {
      newID = shortID();
    }
    return shortID();
  }

  public markRoomIDAsTaken(id: string) {
    this.takenRoomIDs.add(id);
  }

  public unmarkRoomIDAsTaken(id: string) {
    this.takenRoomIDs.delete(id);
  }

  public static getInstance(): RoomIDService {
    if (!RoomIDService.instance) {
      RoomIDService.instance = new RoomIDService();
    }

    return RoomIDService.instance;
  }
}

export default RoomIDService.getInstance();
