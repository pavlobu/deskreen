import shortId from 'shortid';
// import pixelmatch from 'pixelmatch';
import SimplePeer from 'simple-peer';
import { UAParser } from 'ua-parser-js';
import { connect as connectSocket } from '../../utils/socket';
import {
  prepare as prepareMessage,
  process as processMessage,
} from '../../utils/message';
import setSdpMediaBitrate from './setSdpMediaBitrate';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import { getBrowserFromUAParser, getDeviceTypeFromUAParser, getOSFromUAParser } from '../../utils/userAgentParserHelpers';

interface LocalPeerUser {
  username: string;
  privateKey: string;
  publicKey: string;
}

interface PartnerPeerUser {
  username: string;
  publicKey: string;
}

const nullUser = { username: '', publicKey: '', privateKey: '' };

interface SendEncryptedMessagePayload {
  type: string;
  payload: Record<string, unknown>;
}

interface ReceiveEncryptedMessagePayload {
  payload: string;
  signature: string;
  iv: string;
  keys: { sessionKey: string; signingKey: string }[];
}

export default class LocalTestPeer {
  roomId: string;

  socket: any;

  crypto: Crypto;

  user: LocalPeerUser = nullUser;

  partner: PartnerPeerUser = nullUser;

  peer: any;

  myIP = '';

  myOS: any;

  myDeviceType: any;

  myBrowser: any;

  mousePos: any;

  setUrlCallback: any;

  private uaParser: UAParser;

  canvas: any;

  video: any;

  prevFrame: any;

  largeMismatchFramesCount: number;

  isRequestedHalfQuality: boolean;

  videoAutoQualityOptimizer: VideoAutoQualityOptimizer;

  setMyDeviceDetails: (details: DeviceDetails) => void;

  hostAllowedToConnectCallback: () => void;

  constructor(
    setUrlCallback: any,
    crypto: Crypto,
    videoAutoQualityOptimizer: VideoAutoQualityOptimizer,
    setMyDeviceDetailsCallback: (details: DeviceDetails) => void,
    hostAllowedToConnectCallback: () => void
  ) {
    this.setUrlCallback = setUrlCallback;
    this.crypto = crypto;
    this.videoAutoQualityOptimizer = videoAutoQualityOptimizer;
    this.setMyDeviceDetails = setMyDeviceDetailsCallback;
    this.hostAllowedToConnectCallback = hostAllowedToConnectCallback;
    this.roomId = encodeURI(window.location.pathname.replace('/', ''));
    this.socket = connectSocket(this.roomId);
    this.uaParser = new UAParser();
    this.createUserAndInitSocket();
    this.createPeer();

    this.video = null;
    this.canvas = null;
    this.largeMismatchFramesCount = 0;
    this.isRequestedHalfQuality = false;
  }

  log(...toLog: any[]) {
    console.log('LocalTestPeer - ', ...toLog);
  }

  createPeer() {
    const peer = new SimplePeer({
      initiator: false,
      // trickle: true,
      // stream: null,
      // allowHalfTrickle: false,
      config: { iceServers: [] },
      sdpTransform: (sdp) => {
        let newSDP = sdp;
        newSDP = (setSdpMediaBitrate(
          (newSDP as unknown) as string,
          'video',
          500000
        ) as unknown) as typeof sdp;
        return newSDP;
      },
    });

    peer.on('stream', (stream) => {
      setTimeout(() => {
        (document.querySelector(
          '#video-local-test-peer-sees'
        ) as any).srcObject = stream;
      }, 1000);

      this.videoAutoQualityOptimizer.setGoodQualityCallback(() => {
        this.peer.send('set good quality');
      });

      this.videoAutoQualityOptimizer.setHalfQualityCallbak(() => {
        this.peer.send('set half quality');
      });

      this.videoAutoQualityOptimizer.startOptimizationLoop();

      this.setUrlCallback(stream);
    });

    peer.on('signal', (data) => {
      // fired when webrtc done preparation to start call on this machine
      this.sendEncryptedMessage({
        type: 'CALL_ACCEPTED',
        payload: {
          signalData: data,
        },
      });
    });

    this.peer = peer;
  }

  initApp(user: LocalPeerUser, myIP: string) {
    if (!this.socket) return;
    this.socket.emit('USER_ENTER', {
      username: user.username,
      publicKey: user.publicKey,
      ip: myIP,
    });
  }

  createUser() {
    return new Promise<LocalPeerUser>(async (resolve) => {
      const username = shortId.generate();

      const encryptDecryptKeys = await this.crypto.createEncryptDecryptKeys();
      const exportedEncryptDecryptPrivateKey = await this.crypto.exportKey(
        encryptDecryptKeys.privateKey
      );
      const exportedEncryptDecryptPublicKey = await this.crypto.exportKey(
        encryptDecryptKeys.publicKey
      );

      resolve({
        username,
        privateKey: exportedEncryptDecryptPrivateKey,
        publicKey: exportedEncryptDecryptPublicKey,
      });
    });
  }

  async sendEncryptedMessage(payload: SendEncryptedMessagePayload) {
    if (!this.socket) return;
    if (!this.user) return;
    if (!this.partner) return;
    const msg = (await prepareMessage(payload, this.user, this.partner)) as any;
    this.log('encrypted message', msg);
    this.socket.emit('ENCRYPTED_MESSAGE', msg.toSend);
  }

  async receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload) {
    if (!this.user) return;
    const message = (await processMessage(
      payload,
      this.user.privateKey
    )) as any;
    if (message.type === 'CALL_USER') {
      this.log('ACCEPTING CALL USER', message);
      this.peer.signal(message.payload.signalData);
    }
    if (message.type === 'DENY_TO_CONNECT') {
      this.log('OH NO, deny to connect...');
    }
    if (message.type === 'DISCONNECT_BY_HOST_MACHINE_USER') {
      this.log('DAMN, you were disconnected by host machine user!');
    }
    if (message.type === 'ALLOWED_TO_CONNECT') {
      this.hostAllowedToConnectCallback();
    }
  }

  createUserAndInitSocket() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    const userCreatedCallback = (createdUser: LocalPeerUser) => {
      this.user = createdUser;

      this.socket.on('disconnect', () => {
        // this.props.toggleSocketConnected(false);
      });

      this.socket.on('connect', () => {
        this.socket.emit('GET_MY_IP', (ip: string) => {
          // TODO: use set ip callback here, that will change the UI of react component
          // @ts-ignore
          // document.querySelector('#my-ip')?.innerHTML = ip;
          this.myIP = ip;
          this.uaParser.setUA(window.navigator.userAgent);
          // const osFromUAParser = this.uaParser.getResult().os;
          // const deviceTypeFromUAParser = this.uaParser.getResult().device;
          // const browserFromUAParser = this.uaParser.getResult().browser;

          // this.myOS = `${osFromUAParser.name ? osFromUAParser.name : ''} ${
          //   osFromUAParser.version ? osFromUAParser.version : ''
          // }`;
          // this.myDeviceType = deviceTypeFromUAParser.type
          // ? deviceTypeFromUAParser.type.toString()
          // : 'computer';
          this.myOS = getOSFromUAParser(this.uaParser);
          this.myDeviceType = getDeviceTypeFromUAParser(this.uaParser);
          // this.myBrowser = `${browserFromUAParser.name ? browserFromUAParser.name : ''} ${
          //   browserFromUAParser.version ? browserFromUAParser.version : ''
          // }`;
          this.myBrowser = getBrowserFromUAParser(this.uaParser);

          this.initApp(createdUser, ip);
        });
      });

      this.socket.on('USER_ENTER', (payload: { users: PartnerPeerUser[] }) => {
        const filteredPartner = payload.users.filter((v) => {
          return createdUser.publicKey !== v.publicKey;
        });

        this.partner = filteredPartner[0];

        this.sendEncryptedMessage({
          type: 'ADD_USER',
          payload: {
            username: createdUser.username,
            publicKey: createdUser.publicKey,
            isOwner: true,
            id: createdUser.username,
          },
        });

        // TODO: send device details as strings here!
        this.sendEncryptedMessage({
          type: 'DEVICE_DETAILS',
          payload: {
            socketID: this.socket.io.engine.id,
            os: this.myOS,
            deviceType: this.myDeviceType,
            browser: this.myBrowser,
            deviceScreenWidth: window.screen.width,
            deviceScreenHeight: window.screen.height,
          },
        });

        setTimeout(() => {
          this.setMyDeviceDetails({
            myIP: this.myIP,
            myOS: this.myOS,
            myBrowser: this.myBrowser,
            myDeviceType: this.myDeviceType,
          });
        }, 100);
      });

      this.socket.on('USER_EXIT', (payload: any) => {
        // this.props.receiveUnencryptedMessage('USER_EXIT', payload);
      });

      this.socket.on(
        'ENCRYPTED_MESSAGE',
        (payload: ReceiveEncryptedMessagePayload) => {
          this.receiveEncryptedMessage(payload);
        }
      );

      this.socket.on('ROOM_LOCKED', (payload: any) => {
        // TODO: call ROOM LOCKED callback to change react component contain ROOM LOCKED message
        // @ts-ignore
        // document.querySelector('#my-ip')?.innerHTML = 'ROOM LOCKED';
      });

      window.addEventListener('beforeunload', (_) => {
        this.socket.emit('USER_DISCONNECT');
      });
    };

    this.createUser().then((newUser: LocalPeerUser) =>
      userCreatedCallback(newUser)
    );
  }
}
