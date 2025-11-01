import crypto from 'crypto';
import shortID from 'shortid';

export default class RoomIDService {
  takenRoomIDs: Set<string>;

  nextSimpleRoomID: number;

  constructor() {
    this.takenRoomIDs = new Set<string>();
    this.nextSimpleRoomID = 1;
    // TODO: load saved taken room ids from local storage, will be useful for saved devices feature in FUTURE
  }

  getSimpleAvailableRoomID(): Promise<string> {
    this.nextSimpleRoomID += 1;
    return new Promise<string>((resolve, reject) => {
      crypto.randomBytes(3, (error, buffer) => {
        if (error) {
          reject(error);
          return;
        }
        const decimalString = parseInt(buffer.toString('hex'), 16).toString().padStart(6, '0');
        resolve(decimalString.substring(0, 6));
      });
    });
  }

  getShortIDStringOfAvailableRoom(): Promise<string> {
    return new Promise<string>((resolve) => {
      let newID = shortID();
      while (this.takenRoomIDs.has(newID)) {
        newID = shortID();
      }
      resolve(newID);
    });
  }

  markRoomIDAsTaken(id: string): void {
    this.takenRoomIDs.add(id);
  }

  unmarkRoomIDAsTaken(id: string): void {
    this.takenRoomIDs.delete(id);
  }

  isRoomIDTaken(id: string): boolean {
    return this.takenRoomIDs.has(id);
  }
}
