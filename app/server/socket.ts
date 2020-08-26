/* eslint-disable no-async-promise-executor */
import _ from 'lodash';
import Io from 'socket.io';
// eslint-disable-next-line import/no-cycle
import { getIO } from './signalingServer';
import getStore from './store';

interface User {
  socketId: string;
  publicKey: string;
  isOwner: boolean;
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
      if (getStore().hasSocketAdapter) {
        // TODO: what is this?
        // getIO()
        //   .of('/')
        //   .adapter.remoteJoin(socket.id, roomId, (err: Error) => {
        //     if (err) {
        //       reject();
        //     }
        //     resolve();
        //   });
      } else {
        socket.join(roomId, (err) => {
          if (err) {
            reject();
          }
          resolve();
        });
      }
    });
  }

  async handleSocket(socket: Io.Socket) {
    socket.on('ENCRYPTED_MESSAGE', (payload) => {
      socket.to(this.roomId).emit('ENCRYPTED_MESSAGE', payload);
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
      }

      const newRoom: Room = {
        ...room,
        users: [
          ...(room.users || []),
          {
            socketId: socket.id,
            publicKey: payload.publicKey,
            isOwner: (room.users || []).length === 0,
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

    socket.on('disconnect', () => this.handleDisconnect(socket));

    socket.on('USER_DISCONNECT', () => this.handleDisconnect(socket));
  }

  async handleDisconnect(socket: Io.Socket) {
    const room: Room = (await this.fetchRoom()) as Room;

    const newRoom = {
      ...room,
      users: (room.users || [])
        .filter((u) => u.socketId !== socket.id)
        .map((u, index) => ({
          ...u,
          isOwner: index === 0,
        })),
    };

    await this.saveRoom(newRoom);

    getIO().to(this.roomId).emit('USER_EXIT', newRoom.users);

    if (newRoom.users && newRoom.users.length === 0) {
      await this.destroyRoom();
    }

    socket.disconnect(true);
  }
}
