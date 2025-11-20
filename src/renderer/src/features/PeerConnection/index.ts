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
import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';

import { Device } from '../../../../common/Device';
import { LocalPeerUser } from '../../../../common/LocalPeerUser';
import type { SendEncryptedMessagePayload } from '../../../../common/SendEncryptedMessagePayload';
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

	constructor(
		roomID: string,
		sharingSessionID: string,
		user: LocalPeerUser,
		port: string,
	) {
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
		this.onDeviceConnectedCallback = () => {
			// noop until UI layer registers callback
		};

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

		// clear old display size when switching sources to ensure new source uses correct dimensions
		this.sourceDisplaySize = undefined;
		this.displayID = '';

		await this.setDisplayIDByDesktopCapturerSourceID();

		await this.handleCreatePeerAfterDesktopCapturerSourceIDWasSet();
	}

	async setDisplayIDByDesktopCapturerSourceID(): Promise<void> {
		if (
			!this.desktopCapturerSourceID.includes(DesktopCapturerSourceType.SCREEN)
		) {
			// clear display size for window sources
			this.sourceDisplaySize = undefined;
			return;
		}

		this.displayID = await window.electron.ipcRenderer.invoke(
			IpcEvents.GetSourceDisplayIDByDesktopCapturerSourceID,
			this.desktopCapturerSourceID,
		);

		if (this.displayID !== '') {
			// await to ensure sourceDisplaySize is set before creating stream
			await this.setDisplaySizeRetreivedFromMainProcess();
		}
	}

	async setDisplaySizeRetreivedFromMainProcess(): Promise<void> {
		const size: DisplaySize | 'undefined' =
			await window.electron.ipcRenderer.invoke(
				'get-display-size-by-display-id',
				this.displayID,
			);
		if (size !== 'undefined') {
			this.sourceDisplaySize = size;
		}
	}

	async handleCreatePeerAfterDesktopCapturerSourceIDWasSet(): Promise<void> {
		// if peer already exists, replace the track instead of creating a new peer
		if (this.peer !== NullSimplePeer && this.localStream) {
			try {
				const oldTrack = this.localStream.getVideoTracks()[0];
				if (!oldTrack) {
					await this.createPeer();
					if (!this.sourceDisplaySize) {
						setDisplaySizeFromLocalStream(this);
					}
					return;
				}

				const newStream = await getDesktopSourceStreamBySourceID(
					this.desktopCapturerSourceID,
					this.sourceDisplaySize?.width,
					this.sourceDisplaySize?.height,
					0.5,
					1,
				);
				const newVideoTrack = newStream.getVideoTracks()[0];

				if (!newVideoTrack) {
					await this.createPeer();
					if (!this.sourceDisplaySize) {
						setDisplaySizeFromLocalStream(this);
					}
					return;
				}

				// store reference to old stream before replacement
				const oldStream = this.localStream;

				// replace the track in the existing peer
				// replaceTrack will add the new track to the old stream
				await this.peer.replaceTrack(oldTrack, newVideoTrack, oldStream);

				// stop only the old track (it's already removed from the stream by replaceTrack)
				oldTrack.stop();

				// stop any remaining tracks in the old stream (should be none, but just in case)
				// but don't stop the new track that was just added by replaceTrack
				oldStream.getTracks().forEach((track) => {
					if (track.id !== newVideoTrack.id) {
						track.stop();
					}
				});

				// update local stream reference to the new stream
				// the new stream's track is now being used in the peer connection
				this.localStream = newStream;

				// update sourceDisplaySize from actual stream to ensure correct resolution
				// this is critical when switching sources to get the actual stream dimensions
				if (
					this.desktopCapturerSourceID.includes(
						DesktopCapturerSourceType.SCREEN,
					)
				) {
					setDisplaySizeFromLocalStream(this);
				} else {
					// clear for window sources
					this.sourceDisplaySize = undefined;
				}
			} catch (error) {
				console.error('Failed to replace stream track:', error);
				// fallback to creating a new peer if replacement fails
				await this.createPeer();
				if (!this.sourceDisplaySize) {
					setDisplaySizeFromLocalStream(this);
				}
			}
		} else {
			await this.createPeer();
			if (!this.sourceDisplaySize) {
				setDisplaySizeFromLocalStream(this);
			}
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

	async sendEncryptedMessage(
		payload: SendEncryptedMessagePayload,
	): Promise<void> {
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
