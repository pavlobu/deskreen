import { prepare as prepareMessage } from '../../utils/message';
import { connectSocket } from '../../../../common/connectSocket';
import handleCreatePeer from './handleCreatePeer';
import handleSocket from './handleSocket';
import { handleRecieveEncryptedMessage } from '../../utils/handleRecieveEncryptedMessage';
import handleSelfDestroy from './handleSelfDestroy';
import NullUser from './NullUser';
import NullSimplePeer from './NullSimplePeer';
import setDisplaySizeFromLocalStream from './handleSetDisplaySizeFromLocalStream';
import DesktopCapturerSourceType from '../../../../common/DesktopCapturerSourceType';
import getAppLanguage from '../../../../common/getAppLanguage';
import { IpcEvents } from '../../../../common/IpcEvents.enum';

import { Device } from '../../../../common/Device';
import { LocalPeerUser } from '../../../../common/LocalPeerUser';
import { Socket } from 'socket.io-client';

type DisplaySize = { width: number; height: number };

export interface PartnerPeerUser {
  username: string;
}

export default class PeerConnection {
  sharingSessionID: string;
  roomID: string;
  socket: Socket;
  user: LocalPeerUser;
  partner: PartnerPeerUser;
  peer = NullSimplePeer;
  desktopCapturerSourceID: string;
  localStream: MediaStream | null;
  isSocketRoomLocked: boolean;
  partnerDeviceDetails = {
    id: '',
    sharingSessionID: '',
    deviceOS: '',
    deviceType: '',
    deviceIP: '',
    deviceBrowser: '',
    deviceScreenWidth: 0,
    deviceScreenHeight: 0,
  } as Device;
  signalsDataToCallUser: string[];
  isCallStarted: boolean;
  onDeviceConnectedCallback: (device: Device) => void;
  displayID: string;
  sourceDisplaySize: DisplaySize | undefined;
  beforeunloadHandler: (() => void) | null = null;

  constructor(roomID: string, sharingSessionID: string, user: LocalPeerUser, port: string) {
    this.sharingSessionID = sharingSessionID;
    this.isSocketRoomLocked = false;
    this.roomID = encodeURI(roomID);
    this.socket = connectSocket(port, this.roomID);
    this.user = user;
    this.partner = NullUser;
    this.desktopCapturerSourceID = '';
    this.signalsDataToCallUser = [];
    this.isCallStarted = false;
    this.localStream = null;
    this.displayID = '';
    this.sourceDisplaySize = undefined;
    this.onDeviceConnectedCallback = () => {};

    handleSocket(this);

    this.beforeunloadHandler = () => {
      this.socket.emit('USER_DISCONNECT');
    };
    window.addEventListener('beforeunload', this.beforeunloadHandler);
  }

  notifyClientWithNewLanguage(): void {
    setTimeout(async () => {
      this.sendEncryptedMessage({
        type: 'APP_LANGUAGE',
        payload: {
          value: await getAppLanguage(),
        },
      });
    }, 1000);
  }

  async setDesktopCapturerSourceID(id: string): Promise<void> {
    this.desktopCapturerSourceID = id;
    if (process.env.RUN_MODE === 'test') return;

    this.setDisplayIDByDesktopCapturerSourceID();

    this.handleCreatePeerAfterDesktopCapturerSourceIDWasSet();
  }

  async setDisplayIDByDesktopCapturerSourceID(): Promise<void> {
    if (!this.desktopCapturerSourceID.includes(DesktopCapturerSourceType.SCREEN)) return;

    this.displayID = await window.electron.ipcRenderer.invoke(
      IpcEvents.GetSourceDisplayIDByDesktopCapturerSourceID,
      this.desktopCapturerSourceID,
    );

    if (this.displayID !== '') {
      this.setDisplaySizeRetreivedFromMainProcess();
    }
  }

  async setDisplaySizeRetreivedFromMainProcess(): Promise<void> {
    const size: DisplaySize | 'undefined' = await window.electron.ipcRenderer.invoke(
      'get-display-size-by-display-id',
      this.displayID,
    );
    if (size !== 'undefined') {
      this.sourceDisplaySize = size;
    }
  }

  async handleCreatePeerAfterDesktopCapturerSourceIDWasSet(): Promise<void> {
    await this.createPeer();
    if (!this.sourceDisplaySize) {
      setDisplaySizeFromLocalStream(this);
    }
  }

  setOnDeviceConnectedCallback(callback: (device: Device) => void): void {
    this.onDeviceConnectedCallback = callback;
  }

  async denyConnectionForPartner(): Promise<void> {
    await this.sendEncryptedMessage({
      type: 'DENY_TO_CONNECT',
      payload: {},
    });
    this.disconnectPartner();
  }

  sendUserAllowedToConnect(): void {
    this.sendEncryptedMessage({
      type: 'ALLOWED_TO_CONNECT',
      payload: {},
    });
  }

  async disconnectByHostMachineUser(deviceId: string): Promise<void> {
    if (this.partnerDeviceDetails.id !== deviceId) {
      return;
    }
    await this.sendEncryptedMessage({
      type: 'DISCONNECT_BY_HOST_MACHINE_USER',
      payload: {},
    });
    this.disconnectPartner();
    this.selfDestroy();
  }

  disconnectPartner(): void {
    this.socket.emit('DISCONNECT_SOCKET_BY_DEVICE_IP', {
      ip: this.partnerDeviceDetails.deviceIP,
    });

    this.partnerDeviceDetails = {} as Device;
  }

  selfDestroy(): void {
    handleSelfDestroy(this);
  }

  emitUserEnter(): void {
    this.socket.emit('USER_ENTER', {
      username: this.user.username,
    });
  }

  async sendEncryptedMessage(payload: SendEncryptedMessagePayload): Promise<void> {
    if (!this.socket) return;
    if (!this.user) return;
    if (!this.partner) return;
    if (!this.partner.username) return;
    const msg = await prepareMessage(payload, this.user);
    this.socket.emit('MESSAGE', msg.toSend);
  }

  receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload): void {
    if (!this.user) return;
    handleRecieveEncryptedMessage(this, payload);
  }

  callPeer(): void {
    if (process.env.RUN_MODE === 'test') return;
    if (this.isCallStarted) return;
    this.isCallStarted = true;

    this.signalsDataToCallUser.forEach((data: string) => {
      this.sendEncryptedMessage({
        type: 'CALL_USER',
        payload: {
          signalData: data,
        },
      });
    });
  }

  createPeer(): Promise<void> {
    return handleCreatePeer(this);
  }

  toggleLockRoom(isConnected: boolean): void {
    this.socket.emit('TOGGLE_LOCK_ROOM');
    this.isSocketRoomLocked = isConnected;
  }
}
