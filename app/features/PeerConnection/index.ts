/* eslint-disable promise/catch-or-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
import { ipcRenderer } from 'electron';
import { prepare as prepareMessage } from '../../utils/message';
import DeskreenCrypto from '../../utils/crypto';
import connectSocket from '../../server/connectSocket';
import handleCreatePeer from './handleCreatePeer';
import handleSocket from './handleSocket';
import handleRecieveEncryptedMessage from './handleRecieveEncryptedMessage';
import handleSelfDestroy from './handleSelfDestroy';
import NullUser from './NullUser';
import NullSimplePeer from './NullSimplePeer';
import setDisplaySizeFromLocalStream from './handleSetDisplaySizeFromLocalStream';
import DesktopCapturerSourceType from '../DesktopCapturerSourcesService/DesktopCapturerSourceType';
import getAppLanguage from '../../utils/getAppLanguage';
import getAppTheme from '../../utils/getAppTheme';
import { IpcEvents } from '../../main/IpcEvents.enum';

type DisplaySize = { width: number; height: number };

export default class PeerConnection {
  sharingSessionID: string;
  roomID: string;
  socket: SocketIOClient.Socket;
  crypto: DeskreenCrypto;
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

  constructor(roomID: string, sharingSessionID: string, user: LocalPeerUser) {
    this.sharingSessionID = sharingSessionID;
    this.isSocketRoomLocked = false;
    this.roomID = encodeURI(roomID);
    this.crypto = new DeskreenCrypto();
    this.socket = connectSocket(this.roomID);
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

    window.addEventListener('beforeunload', () => {
      this.socket.emit('USER_DISCONNECT');
    });
  }

  notifyClientWithNewLanguage() {
    setTimeout(async () => {
      this.sendEncryptedMessage({
        type: 'APP_LANGUAGE',
        payload: {
          value: await getAppLanguage(),
        },
      });
    }, 1000);
  }

  notifyClientWithNewColorTheme() {
    setTimeout(async () => {
      this.sendEncryptedMessage({
        type: 'APP_THEME',
        payload: { value: await getAppTheme() },
      });
    }, 1000);
  }

  async setDesktopCapturerSourceID(id: string) {
    this.desktopCapturerSourceID = id;
    if (process.env.RUN_MODE === 'test') return;

    this.setDisplayIDByDesktopCapturerSourceID();

    this.handleCreatePeerAfterDesktopCapturerSourceIDWasSet();
  }

  async setDisplayIDByDesktopCapturerSourceID() {
    if (
      !this.desktopCapturerSourceID.includes(DesktopCapturerSourceType.SCREEN)
    )
      return;

    this.displayID = await ipcRenderer.invoke(
      IpcEvents.GetSourceDisplayIDByDesktopCapturerSourceID,
      this.desktopCapturerSourceID
    );

    if (this.displayID !== '') {
      this.setDisplaySizeRetreivedFromMainProcess();
    }
  }

  async setDisplaySizeRetreivedFromMainProcess() {
    const size: DisplaySize | 'undefined' = await ipcRenderer.invoke(
      'get-display-size-by-display-id',
      this.displayID
    );
    if (size !== 'undefined') {
      this.sourceDisplaySize = size;
    }
  }

  async handleCreatePeerAfterDesktopCapturerSourceIDWasSet() {
    await this.createPeer();
    if (!this.sourceDisplaySize) {
      setDisplaySizeFromLocalStream(this);
    }
  }

  setOnDeviceConnectedCallback(callback: (device: Device) => void) {
    this.onDeviceConnectedCallback = callback;
  }

  async denyConnectionForPartner() {
    await this.sendEncryptedMessage({
      type: 'DENY_TO_CONNECT',
      payload: {},
    });
    this.disconnectPartner();
  }

  sendUserAllowedToConnect() {
    this.sendEncryptedMessage({
      type: 'ALLOWED_TO_CONNECT',
      payload: {},
    });
  }

  async disconnectByHostMachineUser(deviceId: string) {
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

  disconnectPartner() {
    this.socket.emit('DISCONNECT_SOCKET_BY_DEVICE_IP', {
      ip: this.partnerDeviceDetails.deviceIP,
    });

    this.partnerDeviceDetails = {} as Device;
  }

  selfDestroy() {
    handleSelfDestroy(this);
  }

  emitUserEnter() {
    this.socket.emit('USER_ENTER', {
      username: this.user.username,
      publicKey: this.user.publicKey,
    });
  }

  async sendEncryptedMessage(payload: SendEncryptedMessagePayload) {
    if (!this.socket) return;
    if (!this.user) return;
    if (!this.partner) return;
    const msg = await prepareMessage(payload, this.user, this.partner);
    this.socket.emit('ENCRYPTED_MESSAGE', msg.toSend);
  }

  receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload) {
    if (!this.user) return;
    handleRecieveEncryptedMessage(this, payload);
  }

  callPeer() {
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

  createPeer() {
    return handleCreatePeer(this);
  }

  toggleLockRoom(isConnected: boolean) {
    this.socket.emit('TOGGLE_LOCK_ROOM');
    this.isSocketRoomLocked = isConnected;
  }
}
