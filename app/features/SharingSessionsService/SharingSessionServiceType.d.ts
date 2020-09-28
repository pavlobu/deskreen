import SharingType from './SharingType';

export default interface SharingSessionType {
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
  setDevice: (id: string) => void; // updates connectedDeviceAt with timestamp
  setSharingStream: (stream: MediaStream) => void;
  getSharingStreamForUsage: () => MediaStream;
  setSharingType: (type: SharingType) => void;
  addStatusObserverCallback: (
    callback: SharingSessionStatusObserverCallback
  ) => void;
}

export enum SharingSessionStatus {
  NOT_CONNECTED,
  CONNECTED,
  SHARING,
  ERROR,
}

export type SharingSessionStatusObserverCallback = (
  sharingSessionID: string
) => void;
