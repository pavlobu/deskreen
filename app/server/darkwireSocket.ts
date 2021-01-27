/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * original JS code from darkwire.io
 * translated and adapted to typescript for Deskreen app
 * */

/* eslint-disable no-async-promise-executor */
import _ from 'lodash';
import Io from 'socket.io';
import socketsIPService from './socketsIPService';
import getStore from './store';
import socketIOServerStore from './store/socketIOServerStore';

const LOCALHOST_SOCKET_IP = '127.0.0.1';

interface SocketOPTS {
  roomId: string;
  socket: Io.Socket;
  room: Room;
  roomIdOriginal: string;
}

function isLocalhostSocket(socket: Io.Socket) {
  return socket.request.connection.remoteAddress.includes(LOCALHOST_SOCKET_IP);
}

export default class Socket implements SocketOPTS {
  roomId: string;

  socket: Io.Socket;

  room: Room;

  roomIdOriginal: string;

  constructor(opts: SocketOPTS) {
    const { roomId, socket, room, roomIdOriginal } = opts;

    this.roomId = roomId;
    this.socket = socket;
    this.roomIdOriginal = roomIdOriginal;
    this.room = room;
    if (room.isLocked) {
      this.sendRoomLocked();
      return;
    }

    this.init();
  }

  async init() {
    await this.joinRoom();
    this.handleSocket();
  }

  sendRoomLocked() {
    this.socket.emit('ROOM_LOCKED');
  }

  async saveRoom(room: Room) {
    const json = {
      ...room,
      updatedAt: Date.now(),
    };
    return getStore().set('rooms', this.roomId, JSON.stringify(json));
  }

  async destroyRoom() {
    return getStore().del('rooms', this.roomId);
  }

  fetchRoom() {
    return new Promise(async (resolve) => {
      const res = await getStore().get('rooms', this.roomId);
      resolve(JSON.parse(res || '{}'));
    });
  }

  // eslint-disable-next-line class-methods-use-this
  joinRoom() {
    return new Promise((resolve, reject) => {
      this.socket.join(this.roomId, (err) => {
        if (err) {
          reject();
        }
        resolve(undefined);
      });
    });
  }

  handleSocket() {
    this.socket.on('GET_MY_IP', (acknowledgeFunction) => {
      acknowledgeFunction(socketsIPService.getSocketIPByID(this.socket.id));
    });

    this.socket.on('GET_IP_BY_SOCKET_ID', (socketID, acknowledgeFunction) => {
      if (!isLocalhostSocket(this.socket)) {
        return;
      }
      acknowledgeFunction(socketsIPService.getSocketIPByID(socketID));
    });

    this.socket.on('IS_ROOM_LOCKED', async (acknowledgeFunction) => {
      const room: Room = (await this.fetchRoom()) as Room;
      acknowledgeFunction(room.isLocked);
    });

    this.socket.on('ENCRYPTED_MESSAGE', (payload) => {
      payload.fromSocketID = this.socket.id;
      this.socket.to(this.roomId).emit('ENCRYPTED_MESSAGE', payload);
    });

    this.socket.on('DISCONNECT_SOCKET_BY_DEVICE_IP', async (payload) => {
      const room: Room = (await this.fetchRoom()) as Room;
      const ownerUser = (room.users || []).find(
        (u) => u.socketId === this.socket.id && u.isOwner
      );
      if (!ownerUser) return;
      const socketIDToDisconnect = socketsIPService.getSocketIDByIP(payload.ip);
      if (!socketIDToDisconnect) return;

      this.handleDisconnect(
        socketIOServerStore.getServer().sockets.connected[socketIDToDisconnect]
      );
    });

    this.socket.on('USER_ENTER', async (payload) => {
      let room: Room = (await this.fetchRoom()) as Room;
      if (_.isEmpty(room)) {
        room = {
          id: this.roomId,
          users: [],
          isLocked: false,
          createdAt: Date.now(),
        };
      } else {
        const userFound = room.users.find(
          (r) => r.publicKey === payload.publicKey
        );
        if (userFound) return;
      }

      const newRoom: Room = {
        ...room,
        users: [
          ...(room.users || []),
          {
            socketId: this.socket.id,
            publicKey: payload.publicKey,
            isOwner: isLocalhostSocket(this.socket),
            ip: payload.ip ? payload.ip : '', // TODO: remove as it is not used
          },
        ],
      };
      await this.saveRoom(newRoom);

      socketIOServerStore
        .getServer()
        .to(this.roomId)
        .emit('USER_ENTER', {
          ...newRoom,
          id: this.roomIdOriginal,
        });
    });

    this.socket.on('TOGGLE_LOCK_ROOM', async () => {
      // TODO: in here if there is somehow already more than ONE client connected, then we were spoofed! Need to add code to interrupt connection immediately.
      const room: Room = (await this.fetchRoom()) as Room;
      const user = (room.users || []).find(
        (u) => u.socketId === this.socket.id && u.isOwner
      );

      if (!user) {
        return;
      }

      await this.saveRoom({
        ...room,
        isLocked: !room.isLocked,
      });
    });

    this.socket.on('disconnect', () => {
      this.handleDisconnect(this.socket);
    });

    this.socket.on('USER_DISCONNECT', () => {
      this.handleDisconnect(this.socket);
    });
  }

  async handleDisconnect(socket: Io.Socket) {
    const room: Room = (await this.fetchRoom()) as Room;
    const isOwnerUser = !!(room.users || []).find(
      (u) => u.socketId === socket.id && u.isOwner
    );

    const newRoom = {
      ...room,
      users: (room.users || [])
        .filter((u) => u.socketId !== socket.id)
        .map((u, index) => ({
          ...u,
          isOwner: index === 0,
        })),
    };

    if (isOwnerUser) {
      this.disconnectAllUsers(newRoom);
      await this.destroyRoom();
    } else {
      await this.saveRoom(newRoom);
    }

    socketIOServerStore
      .getServer()
      .to(this.roomId)
      .emit('USER_EXIT', newRoom.users);

    socket.disconnect(true);
  }

  // eslint-disable-next-line class-methods-use-this
  disconnectAllUsers(room: Room) {
    room.users.forEach((u) => {
      if (socketIOServerStore.getServer().sockets.connected[u.socketId]) {
        socketIOServerStore
          .getServer()
          .sockets.connected[u.socketId].disconnect();
      }
    });
  }
}
