/* eslint-disable @typescript-eslint/lines-between-class-members */
import uuid from 'uuid';
import SharingSessionServiceType, {
  SharingSessionStatus,
  SharingSessionStatusObserverCallback,
} from './SharingSessionServiceType';
import SharingType from './SharingType';

export default class SharingSessionService
  implements SharingSessionServiceType {
  id: string;
  deviceID: string;
  sharingType: SharingType;
  sharingStream: MediaStream | null;
  roomID: string;
  connectedDeviceAt: Date;
  sharingStartedAt: Date;
  status: SharingSessionStatus;
  statusObserverCallbacks: SharingSessionStatusObserverCallback[];
  notifyStatusObservers: () => void;
  updateStatus: (newStatus: SharingSessionStatus) => void;
  setDevice: (id: string) => void;
  setSharingStream: (stream: MediaStream) => void;
  getSharingStreamForUsage: () => MediaStream;
  setSharingType: (type: SharingType) => void;
  addStatusObserverCallback: (
    callback: SharingSessionStatusObserverCallback
  ) => void;

  constructor() {
    this.id = uuid.v4();
    this.deviceID = '';
    this.sharingType = SharingType.NOT_SET;
    this.sharingStream = null;
  }
}
