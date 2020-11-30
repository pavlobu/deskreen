/* eslint-disable promise/catch-or-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
import { remote, ipcRenderer } from 'electron';
import uuid from 'uuid';
import SimplePeer from 'simple-peer';
import {
  prepare as prepareMessage,
  process as processMessage,
} from '../../utils/message';
import DeskreenCrypto from '../../utils/crypto';
import ConnectedDevicesService from '../ConnectedDevicesService';
import SharingSessionStatusEnum from '../SharingSessionsService/SharingSessionStatusEnum';
import RoomIDService from '../../server/RoomIDService';
import SharingSessionsService from '../SharingSessionsService';
import connectSocket from '../../server/connectSocket';
import Logger from '../../utils/logger';
import DesktopCapturerSources from '../DesktopCapturerSourcesService';
import setSdpMediaBitrate from './setSdpMediaBitrate';
import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';
import prepareDataMessageToSendScreenSourceType from './prepareDataMessageToSendScreenSourceType';

const log = new Logger(__filename);

interface PartnerPeerUser {
  username: string;
  publicKey: string;
}

interface ReceiveEncryptedMessagePayload {
  payload: string;
  signature: string;
  iv: string;
  keys: { sessionKey: string; signingKey: string }[];
}

interface SendEncryptedMessagePayload {
  type: string;
  payload: Record<string, unknown>;
}

type DisplaySize = { width: number; height: number };

const desktopCapturerSourcesService = remote.getGlobal(
  'desktopCapturerSourcesService'
) as DesktopCapturerSources;

const nullUser = { username: '', publicKey: '', privateKey: '' };
const nullSimplePeer = new SimplePeer();

export default class PeerConnection {
  sharingSessionID: string;
  roomID: string;
  socket: SocketIOClient.Socket;
  crypto: DeskreenCrypto;
  user: LocalPeerUser;
  partner: PartnerPeerUser;
  peer = nullSimplePeer;
  desktopCapturerSourceID: string;
  localStream: MediaStream | null;
  isSocketRoomLocked: boolean;
  partnerDeviceDetails = {} as Device;
  signalsDataToCallUser: string[];
  isCallStarted: boolean;
  roomIDService: RoomIDService;
  connectedDevicesService: ConnectedDevicesService;
  sharingSessionsService: SharingSessionsService;
  onDeviceConnectedCallback: (device: Device) => void;
  prevStreamWidth: number;
  prevStreamHeight: number;
  displayID: string;
  sourceDisplaySize: DisplaySize | undefined;
  appLanguage: string;
  appColorTheme: boolean;

  constructor(
    roomID: string,
    sharingSessionID: string,
    user: LocalPeerUser,
    appColorTheme: boolean,
    appLanguage: string,
    roomIDService: RoomIDService,
    connectedDevicesService: ConnectedDevicesService,
    sharingSessionsService: SharingSessionsService
  ) {
    this.roomIDService = roomIDService;
    this.connectedDevicesService = connectedDevicesService;
    this.sharingSessionsService = sharingSessionsService;
    this.sharingSessionID = sharingSessionID;
    this.isSocketRoomLocked = false;
    this.roomID = encodeURI(roomID);
    this.crypto = new DeskreenCrypto();
    this.socket = connectSocket(this.roomID);
    this.user = user;
    this.partner = nullUser;
    this.desktopCapturerSourceID = '';
    this.signalsDataToCallUser = [];
    this.isCallStarted = false;
    this.localStream = null;
    this.prevStreamWidth = -1;
    this.prevStreamHeight = -1;
    this.displayID = '';
    this.sourceDisplaySize = undefined;
    this.appLanguage = appLanguage;
    this.appColorTheme = appColorTheme;
    this.onDeviceConnectedCallback = () => {};

    this.initSocketWhenUserCreatedCallback();
  }

  setAppLanguage(lang: string) {
    this.appLanguage = lang;
    this.notifyClientWithNewLanguage();
  }

  setAppTheme(theme: boolean) {
    this.appColorTheme = theme;
    this.notifyClientWithNewColorTheme();
  }

  notifyClientWithNewLanguage() {
    this.sendEncryptedMessage({
      type: 'APP_LANGUAGE',
      payload: { value: this.appLanguage },
    });
  }

  notifyClientWithNewColorTheme() {
    this.sendEncryptedMessage({
      type: 'APP_THEME',
      payload: { value: this.appColorTheme },
    });
  }

  setDesktopCapturerSourceID(id: string) {
    this.desktopCapturerSourceID = id;
    if (process.env.RUN_MODE === 'test') return;

    if (id.includes('screen')) {
      this.displayID = desktopCapturerSourcesService.getSourceDisplayIDBySourceID(
        id
      );

      if (this.displayID !== '') {
        ipcRenderer
          .invoke('get-display-size-by-display-id', this.displayID)
          .then((size: DisplaySize | 'undefined') => {
            if (size !== 'undefined') {
              this.sourceDisplaySize = size;
            }
            return size;
          })
          .then(() => {
            this.createPeer();
            return undefined;
          });
      }
    } else {
      this.createPeer();
    }
  }

  setOnDeviceConnectedCallback(callback: (device: Device) => void) {
    this.onDeviceConnectedCallback = callback;
  }

  denyConnectionForPartner() {
    this.sendEncryptedMessage({
      type: 'DENY_TO_CONNECT',
      payload: {},
    })
      // eslint-disable-next-line promise/always-return
      .then(() => {
        this.disconnectPartner();
      })
      .catch((e) => {
        log.error(e);
      });
  }

  sendUserAllowedToConnect() {
    this.sendEncryptedMessage({
      type: 'ALLOWED_TO_CONNECT',
      payload: {},
    });
  }

  disconnectByHostMachineUser() {
    this.sendEncryptedMessage({
      type: 'DISCONNECT_BY_HOST_MACHINE_USER',
      payload: {},
    })
      // eslint-disable-next-line promise/always-return
      .then(() => {
        this.disconnectPartner();
        this.selfDestrory();
      })
      .catch((e) => {
        log.error(e);
      });
  }

  disconnectPartner() {
    this.socket.emit('DISCONNECT_SOCKET_BY_DEVICE_IP', {
      ip: this.partnerDeviceDetails.deviceIP,
    });

    this.partnerDeviceDetails = {} as Device;
  }

  private initSocketWhenUserCreatedCallback() {
    this.socket.removeAllListeners();

    this.socket.on('disconnect', () => {
      this.selfDestrory();
    });

    this.socket.on('connect', () => {
      // this.emitUserEnter();
    });

    this.socket.on('USER_ENTER', (payload: { users: PartnerPeerUser[] }) => {
      const filteredPartner = payload.users.filter((user: PartnerPeerUser) => {
        return this.user.publicKey !== user.publicKey;
      });

      if (filteredPartner[0] === undefined) return;

      [this.partner] = filteredPartner;

      this.sendEncryptedMessage({
        type: 'ADD_USER',
        payload: {
          username: this.user.username,
          publicKey: this.user.publicKey,
          isOwner: true,
          id: this.user.username,
        },
      });

      if (this.partner.publicKey !== '') {
        this.socket.emit('TOGGLE_LOCK_ROOM', null, () => {
          this.isSocketRoomLocked = true;
          this.emitUserEnter();
        });
      }
    });

    this.socket.on('USER_EXIT', () => {
      if (this.isSocketRoomLocked) {
        this.socket.emit('TOGGLE_LOCK_ROOM', null, () => {});
        this.isSocketRoomLocked = false;

        if (this.isCallStarted) {
          // TODO: display toast device is gone ....
          this.selfDestrory();
        }
      }
    });

    this.socket.on(
      'ENCRYPTED_MESSAGE',
      (payload: ReceiveEncryptedMessagePayload) => {
        this.receiveEncryptedMessage(payload);
      }
    );

    this.socket.on('USER_DISCONNECT', () => {
      this.socket.emit('TOGGLE_LOCK_ROOM', null, () => {});
    });

    // socketConnection.on('TOGGLE_LOCK_ROOM', payload => {
    //   this.props.receiveUnencryptedMessage('TOGGLE_LOCK_ROOM', payload);
    // });

    // socketConnection.on('ROOM_LOCKED', payload => {
    //   this.props.openModal('Room Locked');
    // });

    window.addEventListener('beforeunload', () => {
      this.socket.emit('USER_DISCONNECT');
    });
  }

  private selfDestrory() {
    this.partner = nullUser;
    this.connectedDevicesService.removeDeviceByID(this.partnerDeviceDetails.id);
    if (this.peer !== nullSimplePeer) {
      this.peer.destroy();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }
    const sharingSession = this.sharingSessionsService.sharingSessions.get(
      this.sharingSessionID
    );
    sharingSession?.setStatus(SharingSessionStatusEnum.DESTROYED);
    sharingSession?.destory();
    this.sharingSessionsService.sharingSessions.delete(this.sharingSessionID);
    this.onDeviceConnectedCallback = () => {};
    this.isCallStarted = false;
    this.socket.disconnect();
    this.roomIDService.unmarkRoomIDAsTaken(this.roomID);
  }

  private emitUserEnter() {
    if (!this.socket) return;
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

  async receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload) {
    if (!this.user) return;
    const message = await processMessage(payload, this.user.privateKey);
    if (message.type === 'CALL_ACCEPTED') {
      this.peer.signal(message.payload.signalData);
    }
    if (message.type === 'DEVICE_DETAILS') {
      this.socket.emit(
        'GET_IP_BY_SOCKET_ID',
        message.payload.socketID,
        (deviceIP: string) => {
          const device = {
            id: uuid.v4(),
            deviceIP,
            deviceType: message.payload.deviceType,
            deviceOS: message.payload.os,
            deviceBrowser: message.payload.browser,
            deviceScreenWidth: message.payload.deviceScreenWidth,
            deviceScreenHeight: message.payload.deviceScreenHeight,
            sharingSessionID: this.sharingSessionID,
          };
          this.partnerDeviceDetails = device;
          this.onDeviceConnectedCallback(device);
        }
      );
    }
    if (message.type === 'GET_APP_THEME') {
      this.sendEncryptedMessage({
        type: 'APP_THEME',
        payload: { value: this.appColorTheme },
      });
    }
    if (message.type === 'GET_APP_LANGUAGE') {
      this.sendEncryptedMessage({
        type: 'APP_LANGUAGE',
        payload: { value: this.appLanguage },
      });
    }
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
    this.createDesktopCapturerStream(this.desktopCapturerSourceID).then(() => {
      const peer = new SimplePeer({
        initiator: true,
        // trickle: true,
        // stream: this.localStream,
        // allowHalfTrickle: false,
        config: { iceServers: [] },
        sdpTransform: (sdp) => {
          let newSDP = sdp;
          newSDP = setSdpMediaBitrate(
            newSDP as string,
            'video',
            500000
          ) as typeof sdp;
          return newSDP;
        },
      });

      if (this.localStream !== null) {
        peer.addStream(this.localStream);
      }

      peer.on('signal', (data: string) => {
        // fired when simple peer and webrtc done preparation to start call on this machine
        this.signalsDataToCallUser.push(data);
      });

      this.peer = peer;

      this.peer.on('data', async (data) => {
        const dataJSON = JSON.parse(data);

        if (dataJSON.type === 'set_video_quality') {
          const maxVideoQualityMultiplier = dataJSON.payload.value;
          const minVideoQualityMultiplier =
            maxVideoQualityMultiplier === 1 ? 0.5 : maxVideoQualityMultiplier;

          if (!this.desktopCapturerSourceID.includes('screen')) return;

          const newStream = await getDesktopSourceStreamBySourceID(
            this.desktopCapturerSourceID,
            this.sourceDisplaySize?.width,
            this.sourceDisplaySize?.height,
            minVideoQualityMultiplier,
            maxVideoQualityMultiplier
          );
          const newVideoTrack = newStream.getVideoTracks()[0];
          const oldTrack = this.localStream?.getVideoTracks()[0];

          if (oldTrack && this.localStream) {
            peer.replaceTrack(oldTrack, newVideoTrack, this.localStream);
            oldTrack.stop();
          }
        }

        if (dataJSON.type === 'get_sharing_source_type') {
          const sourceType = this.desktopCapturerSourceID.includes('screen')
            ? 'screen'
            : 'window';

          this.peer.send(prepareDataMessageToSendScreenSourceType(sourceType));
        }
      });
      return peer;
    });
  }

  // TODO: move outside this file
  createDesktopCapturerStream(sourceID: string) {
    return new Promise((resolve) => {
      try {
        if (process.env.RUN_MODE === 'test') resolve();

        if (!sourceID.includes('screen')) {
          getDesktopSourceStreamBySourceID(sourceID).then((stream) => {
            this.localStream = stream;
            resolve();
            return stream;
          });
        } else {
          // when screen source id
          getDesktopSourceStreamBySourceID(
            sourceID,
            this.sourceDisplaySize?.width,
            this.sourceDisplaySize?.height,
            0.5,
            1
          ).then((stream) => {
            this.localStream = stream;
            resolve();
            return stream;
          });
        }
      } catch (e) {
        log.error(e);
      }
    });
  }
}
