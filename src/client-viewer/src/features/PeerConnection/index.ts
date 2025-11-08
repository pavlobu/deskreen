import shortId from 'shortid';
import SimplePeer from 'simple-peer';
import { UAParser } from 'ua-parser-js';
import { connect as connectSocket } from '../../utils/socket';
import { prepare as prepareMessage } from '../../utils/message';
import setSdpMediaBitrate from './setSdpMediaBitrate';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import { VideoQuality, type VideoQualityType } from '../VideoAutoQualityOptimizer/VideoQualityEnum';
import { prepareDataMessageToChangeQuality } from './simplePeerDataMessages';
import { VIDEO_QUALITY_TO_DECIMAL } from './../../constants/appConstants';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
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
  id: string;
}

interface SendEncryptedMessagePayload {
  type: string;
  payload: Record<string, unknown>;
}

export default class PeerConnection {
  roomId: string;

  socket: any;

  user: LocalPeerUser = NullUser;

  partner: PartnerPeerUser = NullUser;

  peer: null | SimplePeer.Instance = null;

  myDeviceDetails: DeviceDetails = {
    myIP: '',
    myOS: '',
    myDeviceType: '',
    myBrowser: '',
    myRoomId: '',
  };

  setUrlCallback: (url: any) => void;

  uaParser: UAParser;

  screenSharingSourceType: string | undefined = undefined;

  videoQuality: VideoQualityType = VideoQuality.Q_100_PERCENT;

  videoAutoQualityOptimizer: VideoAutoQualityOptimizer;

  isStreamStarted: boolean = false;

  UIHandler: PeerConnectionUIHandler;

  beforeunloadHandler: (() => void) | null = null;

  connectionCheckInterval: NodeJS.Timeout | null = null;

  reconnectTimeout: NodeJS.Timeout | null = null;

  getMyIPTimeout: NodeJS.Timeout | null = null;

  setMyDeviceDetailsTimeout: NodeJS.Timeout | null = null;

  constructor(
    roomId: string,
    setUrlCallback: (url: any) => void,
    videoAutoQualityOptimizer: VideoAutoQualityOptimizer,
    UIHandler: PeerConnectionUIHandler,
  ) {
    this.setUrlCallback = setUrlCallback;
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

    this.connectionCheckInterval = startSocketConnectedCheckingLoop(this);
  }

  setVideoQuality(videoQuality: VideoQualityType) {
    this.videoQuality = videoQuality;
    this.videoQualityChangedCallback();
  }

  videoQualityChangedCallback() {
    if (!this.peer) return;
    if (this.videoQuality === VideoQuality.Q_AUTO) {
      this.peer.send(prepareDataMessageToChangeQuality(1));
    } else {
      this.peer.send(
        prepareDataMessageToChangeQuality(VIDEO_QUALITY_TO_DECIMAL[this.videoQuality]),
      );
    }
  }

  stopStream() {
    // stop the video stream by clearing the stream URL
    this.setUrlCallback(null);
    this.isStreamStarted = false;
    
    // destroy the peer connection
    if (this.peer) {
      try {
        this.peer.removeAllListeners();
        this.peer.destroy();
      } catch (error) {
        console.error('Error destroying peer connection:', error);
      }
      this.peer = null;
    }
  }

  destroy() {
    // remove window event listener
    if (this.beforeunloadHandler) {
      window.removeEventListener('beforeunload', this.beforeunloadHandler);
      this.beforeunloadHandler = null;
    }

    // clear connection check interval
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    // clear all timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.getMyIPTimeout) {
      clearTimeout(this.getMyIPTimeout);
      this.getMyIPTimeout = null;
    }
    if (this.setMyDeviceDetailsTimeout) {
      clearTimeout(this.setMyDeviceDetailsTimeout);
      this.setMyDeviceDetailsTimeout = null;
    }

    // stop stream if started
    if (this.isStreamStarted) {
      this.stopStream();
    }

    // cleanup peer connection
    if (this.peer) {
      try {
        this.peer.removeAllListeners();
        this.peer.destroy();
      } catch (error) {
        console.error('Error destroying peer:', error);
      }
      this.peer = null;
    }

    // cleanup socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }

  createPeer() {
    // cleanup existing peer before creating new one
    if (this.peer) {
      try {
        this.peer.removeAllListeners();
        this.peer.destroy();
      } catch (error) {
        console.error('Error cleaning up existing peer:', error);
      }
      this.peer = null;
    }

    // When we are testing with jest, SimplePeer() can not be created, so we just return
    const peer = new SimplePeer({
      initiator: false,
      config: { iceServers: [] },
      sdpTransform: (sdp) => {
        let newSDP = sdp;
        newSDP = setSdpMediaBitrate(
          newSDP as unknown as string,
          'video',
          500000,
        ) as unknown as typeof sdp;
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
      ip: myIP, // TODO: remove as it is not used
    });
  }

  createUser() {
    return new Promise<LocalPeerUser>((resolve) => {
      const username = shortId.generate();
      const id = shortId.generate();

      resolve({
        username,
        id,
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
    if (!this.partner.username) return;
    prepareMessage(payload, this.user).then((msg: any) => {
      this.socket.emit('MESSAGE', msg.toSend);
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

      this.beforeunloadHandler = () => {
        this.socket.emit('USER_DISCONNECT');
      };
      window.addEventListener('beforeunload', this.beforeunloadHandler);
    };

    this.createUser().then((newUser: LocalPeerUser) => userCreatedCallback(newUser));
  }
}
