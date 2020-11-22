/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * */

/* eslint-disable no-async-promise-executor */
import _ from 'lodash';
import Io from 'socket.io';
// eslint-disable-next-line import/no-cycle
import { getIO } from '.';
import socketsIPService from './socketsIPService';
import getStore from './store';

interface User {
  socketId: string;
  publicKey: string;
  isOwner: boolean;
  ip: string;
}

interface Room {
  id: string;
  users: User[];
  isLocked: boolean;
  createdAt: number;
}

interface SocketOPTS {
  roomId: string;
  socket: Io.Socket;
  room: Room;
  roomIdOriginal: string;
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

    this.init(opts);
  }

  async init(opts: SocketOPTS) {
    const { roomId, socket } = opts;
    await this.joinRoom(roomId, socket);
    this.handleSocket(socket);
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
  joinRoom(roomId: string, socket: Io.Socket) {
    return new Promise((resolve, reject) => {
      socket.join(roomId, (err) => {
        if (err) {
          reject();
        }
        resolve();
      });
    });
  }

  async handleSocket(socket: Io.Socket) {
    socket.on('GET_MY_IP', (acknowledgeFunction) => {
      acknowledgeFunction(socketsIPService.getSocketIPByID(socket.id));
    });

    socket.on('GET_IP_BY_SOCKET_ID', (socketID, acknowledgeFunction) => {
      acknowledgeFunction(socketsIPService.getSocketIPByID(socketID));
    });

    socket.on('IS_ROOM_LOCKED', async (acknowledgeFunction) => {
      const room: Room = (await this.fetchRoom()) as Room;
      acknowledgeFunction(room.isLocked);
    });

    socket.on('ENCRYPTED_MESSAGE', (payload) => {
      socket.to(this.roomId).emit('ENCRYPTED_MESSAGE', payload);
    });

    socket.on('DISCONNECT_SOCKET_BY_DEVICE_IP', async (payload) => {
      const room: Room = (await this.fetchRoom()) as Room;
      const ownerUser = (room.users || []).find(
        (u) => u.socketId === socket.id && u.isOwner
      );
      if (!ownerUser) return;
      const socketIDToDisconnect = socketsIPService.getSocketIDByIP(payload.ip);
      if (!socketIDToDisconnect) return;

      this.handleDisconnect(getIO().sockets.connected[socketIDToDisconnect]);
    });

    socket.on('USER_ENTER', async (payload) => {
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
            socketId: socket.id,
            publicKey: payload.publicKey,
            isOwner: (room.users || []).length === 0,
            ip: payload.ip ? payload.ip : '',
          },
        ],
      };
      await this.saveRoom(newRoom);

      getIO()
        .to(this.roomId)
        .emit('USER_ENTER', {
          ...newRoom,
          id: this.roomIdOriginal,
        });
    });

    socket.on('TOGGLE_LOCK_ROOM', async (__, callback) => {
      const room: Room = (await this.fetchRoom()) as Room;
      const user = (room.users || []).find(
        (u) => u.socketId === socket.id && u.isOwner
      );

      if (!user) {
        // @ts-ignore
        callback({
          isLocked: room.isLocked,
        });
        return;
      }

      await this.saveRoom({
        ...room,
        isLocked: !room.isLocked,
      });

      socket.to(this.roomId).emit('TOGGLE_LOCK_ROOM', {
        locked: !room.isLocked,
        publicKey: user && user.publicKey,
      });

      callback({
        isLocked: !room.isLocked,
      });
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });

    socket.on('USER_DISCONNECT', () => {
      this.handleDisconnect(socket);
    });
  }

  async handleDisconnect(socket: Io.Socket) {
    const room: Room = (await this.fetchRoom()) as Room;
    const ownerUser = (room.users || []).find(
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

    if (ownerUser) {
      // if owner left diconnect all users
      newRoom.users.forEach((u) => {
        if (getIO().sockets.connected[u.socketId]) {
          getIO().sockets.connected[u.socketId].disconnect();
        }
      });
      newRoom.users = [];
    }

    await this.saveRoom(newRoom);

    getIO().to(this.roomId).emit('USER_EXIT', newRoom.users);

    if (newRoom.users && newRoom.users.length === 0) {
      await this.destroyRoom();
    }

    socket.disconnect(true);
  }
}
