import shortID from 'shortid';

export default class RoomIDService {
  public takenRoomIDs: Set<string>;

  nextSimpleRoomID: number;

  constructor() {
    this.takenRoomIDs = new Set<string>();
    this.nextSimpleRoomID = 1;
    // TODO: load saved taken room ids from local storage, will be useful for saved devices feature in FUTURE
  }

  public getSimpleAvailableRoomID(): string {
    this.nextSimpleRoomID += 1;
    return `${this.nextSimpleRoomID - 1}`;
  }

  public getShortIDStringOfAvailableRoom(): Promise<string> {
    return new Promise<string>((resolve) => {
      let newID = shortID();
      while (this.takenRoomIDs.has(newID)) {
        newID = shortID();
      }
      resolve(newID);
    });
  }

  public markRoomIDAsTaken(id: string) {
    this.takenRoomIDs.add(id);
  }

  public unmarkRoomIDAsTaken(id: string) {
    this.takenRoomIDs.delete(id);
  }

  public isRoomIDTaken(id: string) {
    return this.takenRoomIDs.has(id);
  }
}
