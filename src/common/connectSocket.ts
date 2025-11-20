import socketIO from 'socket.io-client';

export const connectSocket = (port: string, roomId: string) => {
	return socketIO(`http://127.0.0.1:${port}`, {
		query: {
			roomId,
		},
		forceNew: true,
	});
};

export default {};
