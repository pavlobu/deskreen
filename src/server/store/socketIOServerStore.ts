import Io from 'socket.io';

class SocketIOServerStore {
	ioServer = {} as unknown as Io.Server;

	setServer(server: Io.Server): void {
		this.ioServer = server;
	}

	getServer(): Io.Server {
		return this.ioServer;
	}
}

const store = new SocketIOServerStore();

export default store;
