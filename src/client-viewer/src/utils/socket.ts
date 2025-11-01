import socketIO, { Socket } from 'socket.io-client';
import { generateUrl } from '../api/generator';

let socket: Socket;

export const connect = (roomId: string) => {
  socket = socketIO(generateUrl(), {
    query: {
      roomId,
    },
    forceNew: true,
  });
  return socket;
};

export const getSocket = () => socket;
