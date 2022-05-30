/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import uuid from 'uuid';
import RoomIDService from '../../server/RoomIDService';
import DeskreenCrypto from '../../utils/crypto';
import ConnectedDevicesService from '../ConnectedDevicesService';
import RendererWebrtcHelpersService from '../PeerConnectionHelperRendererService';
import SharingSession from './SharingSession';
import SharingSessionStatusEnum from './SharingSessionStatusEnum';

export default class SharingSessionService {
  crypto: DeskreenCrypto;
  user: LocalPeerUser | null;
  sharingSessions: Map<string, SharingSession>;
  waitingForConnectionSharingSession: SharingSession | null;
  roomIDService: RoomIDService;
  connectedDevicesService: ConnectedDevicesService;
  rendererWebrtcHelpersService: RendererWebrtcHelpersService;
  isCreatingNewSharingSession: boolean;

  constructor(
    _roomIDService: RoomIDService,
    _connectedDevicesService: ConnectedDevicesService,
    _rendererWebrtcHelpersService: RendererWebrtcHelpersService
  ) {
    this.roomIDService = _roomIDService;
    this.connectedDevicesService = _connectedDevicesService;
    this.rendererWebrtcHelpersService = _rendererWebrtcHelpersService;
    this.crypto = new DeskreenCrypto();
    this.waitingForConnectionSharingSession = null;
    this.sharingSessions = new Map<string, SharingSession>();
    this.user = null;
    this.isCreatingNewSharingSession = false;
    this.createUser();

    setInterval(() => {
      this.pollForInactiveSessions();
    }, 1000 * 60 * 60); // every hour
  }

  createUser(): Promise<undefined> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (process.env.RUN_MODE === 'test') resolve(undefined);
      const username = uuid.v4();

      const encryptDecryptKeys = await this.crypto.createEncryptDecryptKeys();
      const exportedEncryptDecryptPrivateKey = await this.crypto.exportKey(
        encryptDecryptKeys.privateKey
      );
      const exportedEncryptDecryptPublicKey = await this.crypto.exportKey(
        encryptDecryptKeys.publicKey
      );

      this.user = {
        username,
        privateKey: exportedEncryptDecryptPrivateKey,
        publicKey: exportedEncryptDecryptPublicKey,
      };
      resolve(undefined);
    });
  }

  createWaitingForConnectionSharingSession(roomID?: string) {
    return new Promise<SharingSession>((resolve) => {
      return this.waitWhileUserIsNotCreated().then(async () => {
        this.waitingForConnectionSharingSession = await this.createNewSharingSession(
          roomID || ''
        );
        resolve(this.waitingForConnectionSharingSession);
        return this.waitingForConnectionSharingSession;
      });
    });
  }

  async createNewSharingSession(_roomID: string): Promise<SharingSession> {
    const roomID =
      _roomID || (await this.roomIDService.getSimpleAvailableRoomID());
    this.roomIDService.markRoomIDAsTaken(roomID);
    const sharingSession = new SharingSession(
      roomID,
      this.user as LocalPeerUser,
      this.rendererWebrtcHelpersService
    );
    this.sharingSessions.set(sharingSession.id, sharingSession);
    return sharingSession;
  }

  pollForInactiveSessions(): void {
    [...this.sharingSessions.keys()].forEach((key) => {
      // @ts-ignore
      const { status } = this.sharingSessions.get(key);
      if (
        status === SharingSessionStatusEnum.ERROR ||
        status === SharingSessionStatusEnum.DESTROYED
      ) {
        this.sharingSessions.delete(key);
      }
    });
  }

  waitWhileUserIsNotCreated(): Promise<undefined> {
    return new Promise((resolve) => {
      const currentInterval = setInterval(() => {
        if (this.user !== null) {
          resolve(undefined);
          clearInterval(currentInterval);
        }
      }, 1000);
    });
  }
}
