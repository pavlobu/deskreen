import socketIO from 'socket.io-client';
import generateUrl from '../api/urlGenerator';

export default (roomId: string) => {
  return socketIO(generateUrl(), {
    query: {
      roomId,
    },
    forceNew: true,
  });
};
