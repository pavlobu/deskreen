import shortId from 'shortid';
import SimplePeer from 'simple-peer';
import { UAParser } from 'ua-parser-js';
import { connect as connectSocket } from '../../utils/socket';
import { prepare as prepareMessage } from '../../utils/message';
import setSdpMediaBitrate from './setSdpMediaBitrate';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import { VideoQuality } from '../VideoAutoQualityOptimizer/VideoQualityEnum';
import { prepareDataMessageToChangeQuality } from './simplePeerDataMessages';
import { VIDEO_QUALITY_TO_DECIMAL } from './../../constants/appConstants';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
import areWeTestingWithJest from '../../utils/areWeTestingWithJest';
import peerConnectionHandleSocket from './peerConnectionHandleSocket';
import peerConnectionHandlePeer from './peerConnectionHandlePeer';
import peerConnectionReceiveEncryptedMessage from './peerConnectionReceiveEncryptedMessage';
import startSocketConnectedCheckingLoop from './startSocketConnectedCheckingLoop';
import NullUser from './NullUser';
import PeerConnectionUIHandler from './PeerConnectionUIHandler';
import setAndShowErrorDialogMessage from './setAndShowErrorDialogMessage';
import PeerConnectionSocketNotDefined from './errors/PeerConnectionSocketNotDefined';
import PeerConnectionUserIsNotDefinedError from './errors/PeerConnectionUserIsNotDefinedError';
import PeerConnectionPartnerIsNotDefinedError from './errors/PeerConnectionPartnerIsNotDefinedError';

interface LocalPeerUser {
  username: string;
  privateKey: string;
  publicKey: string;
}

interface SendEncryptedMessagePayload {
  type: string;
  payload: Record<string, unknown>;
}

export default class PeerConnection {
  roomId: string;

  socket: any;

  crypto: Crypto;

  user: LocalPeerUser = NullUser;

  partner: PartnerPeerUser = NullUser;

  peer: null | SimplePeer.Instance = null;

  myDeviceDetails: DeviceDetails = {
    myIP: '',
    myOS: '',
    myDeviceType: '',
    myBrowser: '',
  };

  setUrlCallback: (url: any) => void;

  uaParser: UAParser;

  screenSharingSourceType: string | undefined = undefined;

  videoQuality = VideoQuality.Q_AUTO;

  videoAutoQualityOptimizer: VideoAutoQualityOptimizer;

  isStreamStarted: boolean = false;

  UIHandler: PeerConnectionUIHandler;

  constructor(
    roomId: string,
    setUrlCallback: (url: any) => void,
    crypto: Crypto,
    videoAutoQualityOptimizer: VideoAutoQualityOptimizer,
    UIHandler: PeerConnectionUIHandler
  ) {
    this.setUrlCallback = setUrlCallback;
    this.crypto = crypto;
    this.videoAutoQualityOptimizer = videoAutoQualityOptimizer;
    this.UIHandler = UIHandler;
    this.roomId = roomId;
    this.socket = connectSocket(this.roomId);
    this.uaParser = new UAParser();
    this.createUserAndInitSocket();
    this.createPeer();

    if (!this.roomId || this.roomId === '') {
      setAndShowErrorDialogMessage(this, ErrorMessage.NOT_ALLOWED);
    }

    startSocketConnectedCheckingLoop(this);
  }

  setVideoQuality(videoQuality: VideoQuality) {
    this.videoQuality = videoQuality;
    this.videoQualityChangedCallback();
  }

  videoQualityChangedCallback() {
    if (!this.peer) return;
    if (this.videoQuality === VideoQuality.Q_AUTO) {
      this.peer.send(prepareDataMessageToChangeQuality(1));
    } else {
      this.peer.send(
        prepareDataMessageToChangeQuality(
          VIDEO_QUALITY_TO_DECIMAL[this.videoQuality]
        )
      );
    }
  }

  createPeer() {
    // When we are testing with jest, SimplePeer() can not be created, so we just return
    if (areWeTestingWithJest()) return;

    const peer = new SimplePeer({
      initiator: false,
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

    this.peer = peer;
    this.peer.on('error', (e) => {
      console.error('error in simple peer happened!');
      console.error(e);
      setAndShowErrorDialogMessage(this, ErrorMessage.WEBRTC_ERROR);
    });
    peerConnectionHandlePeer(this);
  }

  initApp(user: LocalPeerUser, myIP: string) {
    if (!this.socket) {
      throw new PeerConnectionSocketNotDefined();
    }
    this.socket.emit('USER_ENTER', {
      username: user.username,
      publicKey: user.publicKey,
      ip: myIP, // TODO: remove as it is not used
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

  sendEncryptedMessage(payload: SendEncryptedMessagePayload) {
    if (!this.socket) {
      throw new PeerConnectionSocketNotDefined();
    }
    if (!this.user || this.user === NullUser) {
      throw new PeerConnectionUserIsNotDefinedError();
    }
    if (!this.partner || this.partner === NullUser) {
      throw new PeerConnectionPartnerIsNotDefinedError();
    }
    prepareMessage(payload, this.user, this.partner).then((msg: any) => {
      this.socket.emit('ENCRYPTED_MESSAGE', msg.toSend);
    });
  }

  receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload) {
    peerConnectionReceiveEncryptedMessage(this, payload);
  }

  createUserAndInitSocket() {
    if (!this.socket) {
      throw new PeerConnectionSocketNotDefined();
    }

    this.socket.removeAllListeners();

    const userCreatedCallback = (createdUser: LocalPeerUser) => {
      this.user = createdUser;

      peerConnectionHandleSocket(this);

      window.addEventListener('beforeunload', (_) => {
        this.socket.emit('USER_DISCONNECT');
      });
    };

    this.createUser().then((newUser: LocalPeerUser) =>
      userCreatedCallback(newUser)
    );
  }
}
