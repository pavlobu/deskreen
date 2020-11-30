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
import {
  getBrowserFromUAParser,
  getDeviceTypeFromUAParser,
  getOSFromUAParser,
} from '../../utils/userAgentParserHelpers';
import { VideoQuality } from './VideoQualityEnum';
import prepareDataMessageToChangeQuality from './prepareDataMessageToChangeQuality';
import { VIDEO_QUALITY_TO_DECIMAL } from './../../constants/appConstants';
import prepareDataMessageToGetSharingSourceType from './prepareDataMessageToGetSharingSourceType';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';

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

export default class PeerConnection {
  roomId: string;

  socket: any;

  crypto: Crypto;

  user: LocalPeerUser = nullUser;

  partner: PartnerPeerUser = nullUser;

  peer: null | SimplePeer.Instance = null;

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

  screenSharingSourceType: string | undefined = undefined;

  videoQuality = VideoQuality.Q_AUTO;

  videoAutoQualityOptimizer: VideoAutoQualityOptimizer;

  isDarkTheme: boolean;

  isStreamStarted: boolean = false;

  setMyDeviceDetails: (details: DeviceDetails) => void;

  hostAllowedToConnectCallback: () => void;

  setScreenSharingSourceTypeCallback: (s: 'screen' | 'window') => void;

  setIsDarkThemeCallback: (val: boolean) => void;

  setAppLanguageCallback: (newLang: string) => void;

  setDialogErrorMessageCallback: (message: ErrorMessage) => void;

  setIsErrorDialogOpen: (val: boolean) => void;

  errorDialogMessage = ErrorMessage.UNKNOWN_ERROR;

  constructor(
    setUrlCallback: any,
    crypto: Crypto,
    videoAutoQualityOptimizer: VideoAutoQualityOptimizer,
    isDarkTheme: boolean,
    setMyDeviceDetailsCallback: (details: DeviceDetails) => void,
    hostAllowedToConnectCallback: () => void,
    setScreenSharingSourceTypeCallback: (s: 'screen' | 'window') => void,
    setIsDarkThemeCallback: (val: boolean) => void,
    setAppLanguageCallback: (newLang: string) => void,
    setDialogErrorMessageCallback: (message: ErrorMessage) => void,
    setIsErrorDialogOpen: (val: boolean) => void
  ) {
    this.setUrlCallback = setUrlCallback;
    this.crypto = crypto;
    this.videoAutoQualityOptimizer = videoAutoQualityOptimizer;
    this.isDarkTheme = isDarkTheme;
    this.setMyDeviceDetails = setMyDeviceDetailsCallback;
    this.hostAllowedToConnectCallback = hostAllowedToConnectCallback;
    this.roomId = encodeURI(window.location.pathname.replace('/', ''));
    this.socket = connectSocket(this.roomId);
    this.uaParser = new UAParser();
    this.createUserAndInitSocket();
    this.createPeer();
    this.setScreenSharingSourceTypeCallback = setScreenSharingSourceTypeCallback;
    this.setIsDarkThemeCallback = setIsDarkThemeCallback;
    this.setAppLanguageCallback = setAppLanguageCallback;
    this.setDialogErrorMessageCallback = setDialogErrorMessageCallback;
    this.setIsErrorDialogOpen = setIsErrorDialogOpen;

    this.video = null;
    this.canvas = null;
    this.largeMismatchFramesCount = 0;

    if (!this.roomId || this.roomId === '') {
      setDialogErrorMessageCallback(ErrorMessage.UNKNOWN_ERROR);
      setIsErrorDialogOpen(true);
    }

    setInterval(() => {
      if (!this.socket.connected) {
        if (this.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
          this.setDialogErrorMessageCallback(ErrorMessage.DENY_TO_CONNECT);
          this.setIsErrorDialogOpen(true);
          this.errorDialogMessage = ErrorMessage.DENY_TO_CONNECT;
        }
      }
    }, 2000);
  }

  setVideoQuality(videoQuality: VideoQuality) {
    this.videoQuality = videoQuality;
    this.videoQualityChangedCallback();
  }

  setErrorDialogMessage(message: ErrorMessage) {
    this.errorDialogMessage = message;
  }

  videoQualityChangedCallback() {
    if (this.videoQuality !== VideoQuality.Q_AUTO) {
      this.peer?.send(
        prepareDataMessageToChangeQuality(
          VIDEO_QUALITY_TO_DECIMAL[this.videoQuality]
        )
      );
    } else {
      this.peer?.send(prepareDataMessageToChangeQuality(1));
    }
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
      this.videoAutoQualityOptimizer.setGoodQualityCallback(() => {
        if (this.videoQuality === VideoQuality.Q_AUTO) {
          this.peer?.send(prepareDataMessageToChangeQuality(1));
        }
      });

      this.videoAutoQualityOptimizer.setHalfQualityCallbak(() => {
        if (this.videoQuality === VideoQuality.Q_AUTO) {
          this.peer?.send(prepareDataMessageToChangeQuality(0.5));
        }
      });

      this.videoAutoQualityOptimizer.startOptimizationLoop();

      this.setUrlCallback(stream);
      setTimeout(() => {
        this.peer?.send(prepareDataMessageToGetSharingSourceType());
      }, 1000);

      this.isStreamStarted = true;
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

    peer.on('data', (data) => {
      const dataJSON = JSON.parse(data);

      if (dataJSON.type === 'screen_sharing_source_type') {
        this.screenSharingSourceType = dataJSON.payload.value;
        if (
          this.screenSharingSourceType === 'screen' ||
          this.screenSharingSourceType === 'window'
        ) {
          this.setScreenSharingSourceTypeCallback(this.screenSharingSourceType);
        }
      }
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
    this.socket.emit('ENCRYPTED_MESSAGE', msg.toSend);
  }

  async receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload) {
    if (!this.user) return;
    const message = (await processMessage(
      payload,
      this.user.privateKey
    )) as any;
    if (message.type === 'CALL_USER') {
      this.peer?.signal(message.payload.signalData);
    }
    if (message.type === 'DENY_TO_CONNECT') {
      if (this.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
        this.setDialogErrorMessageCallback(ErrorMessage.DENY_TO_CONNECT);
        this.setIsErrorDialogOpen(true);
        this.errorDialogMessage = ErrorMessage.DENY_TO_CONNECT;
      }
    }
    if (message.type === 'DISCONNECT_BY_HOST_MACHINE_USER') {
      if (this.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
        this.setDialogErrorMessageCallback(ErrorMessage.DICONNECTED);
        this.setIsErrorDialogOpen(true);
        this.errorDialogMessage = ErrorMessage.DICONNECTED;
      }
    }
    if (message.type === 'ALLOWED_TO_CONNECT') {
      this.hostAllowedToConnectCallback();
    }
    if (message.type === 'APP_THEME') {
      if (this.isDarkTheme !== message.payload.value) {
        this.setIsDarkThemeCallback(message.payload.value);
        this.isDarkTheme = message.payload.value;
      }
    }
    if (message.type === 'APP_LANGUAGE') {
      this.setAppLanguageCallback(message.payload.value);
    }
  }

  createUserAndInitSocket() {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    const userCreatedCallback = (createdUser: LocalPeerUser) => {
      this.user = createdUser;

      this.socket.on('disconnect', () => {
        // this.props.toggleSocketConnected(false);
        if (this.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
          this.setDialogErrorMessageCallback(ErrorMessage.DICONNECTED);
          this.setIsErrorDialogOpen(true);
          this.errorDialogMessage = ErrorMessage.DICONNECTED;
        }
      });

      this.socket.on('connect', () => {
        this.socket.emit('GET_MY_IP', (ip: string) => {
          this.myIP = ip;
          this.uaParser.setUA(window.navigator.userAgent);
          this.myOS = getOSFromUAParser(this.uaParser);
          this.myDeviceType = getDeviceTypeFromUAParser(this.uaParser);
          this.myBrowser = getBrowserFromUAParser(this.uaParser);

          this.initApp(createdUser, ip);
        });
      });

      this.socket.on('NOT_ALLOWED', () => {
        if (this.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
          this.setDialogErrorMessageCallback(ErrorMessage.NOT_ALLOWED);
          this.setIsErrorDialogOpen(true);
          this.errorDialogMessage = ErrorMessage.NOT_ALLOWED;
        }
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

        this.sendEncryptedMessage({ type: 'GET_APP_THEME', payload: {} });
        this.sendEncryptedMessage({ type: 'GET_APP_LANGUAGE', payload: {} });

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
        if (this.errorDialogMessage === ErrorMessage.UNKNOWN_ERROR) {
          this.setDialogErrorMessageCallback(ErrorMessage.DENY_TO_CONNECT);
          this.setIsErrorDialogOpen(true);
          this.errorDialogMessage = ErrorMessage.UNKNOWN_ERROR;
        }
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
