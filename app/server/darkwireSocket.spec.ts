/* eslint-disable class-methods-use-this */
/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Io from 'socket.io';
import http from 'http';
import Koa from 'koa';
import DarkwireSocket from './darkwireSocket';

const protocol = http;

class MockConnectSocket {
  testObservers: any;

  constructor() {
    this.testObservers = {};
  }

  join() {}

  on(type: string, callback: any) {
    this.testObservers[type] = callback;
  }

  emit(type: string) {
    if (this.testObservers[type] !== undefined) {
      this.testObservers[type]();
    }
  }
}

describe('DarkwireSocket tests', () => {
  const TEST_ROOM_ID = '123';
  const TEST_ROOM_ID_HASH = '123321';
  const makeTestSocketOPTS = (socket: Io.Socket) => {
    return {
      roomIdOriginal: TEST_ROOM_ID,
      roomId: TEST_ROOM_ID_HASH,
      socket,
      room: {
        id: TEST_ROOM_ID_HASH,
        users: [],
        isLocked: false,
        createdAt: Date.now(),
      },
    };
  };

  let app: Koa<Koa.DefaultState, Koa.DefaultContext>;
  let server: http.Server;
  let io: Io.Server;
  let socket: Io.Socket;

  beforeEach(() => {
    app = new Koa();
    server = protocol.createServer(app.callback());
    io = Io(server, {
      pingInterval: 20000,
      pingTimeout: 5000,
      serveClient: false,
    });

    io.on('connection', (receivedSocket) => {
      socket = receivedSocket;
    });
  });

  it('should set internal socket same as passed in constructor', () => {
    io.emit('connection', {
      join: () => {},
    });
    const customSocket = new DarkwireSocket(makeTestSocketOPTS(socket));

    expect(customSocket.socket).toBe(socket);
  });

  it('should emit "ROOM_LOCKED" on internal socket object when .sendRoomLocked() is called', () => {
    const mockEmitProperty = jest.fn();
    io.emit('connection', {
      emit: mockEmitProperty,
      join: () => {},
    });
    const customSocket = new DarkwireSocket(makeTestSocketOPTS(socket));

    customSocket.sendRoomLocked();

    expect(mockEmitProperty).toBeCalledWith('ROOM_LOCKED');
  });

  it('should call .joinRoom() when socket is created and pass roomId as argument', () => {
    const mockJoinProperty = jest.fn();
    io.emit('connection', {
      join: mockJoinProperty,
    });
    const testSocketOPTS = makeTestSocketOPTS(socket);
    const { roomId } = testSocketOPTS;

    new DarkwireSocket(testSocketOPTS);

    expect(mockJoinProperty).toBeCalledWith(roomId, expect.anything());
  });

  it('should call handleDisconnect when socket.on("disconnect") happened', async () => {
    const mockDisconnectProperty = jest.fn();
    io.emit('connection', new MockConnectSocket());
    const darkwireSocket = new DarkwireSocket(makeTestSocketOPTS(socket));
    Object.defineProperty(darkwireSocket, 'handleDisconnect', {
      value: mockDisconnectProperty,
    });

    await darkwireSocket.handleSocket(socket);
    socket.emit('disconnect');

    expect(mockDisconnectProperty).toBeCalledTimes(1);
  });

  it('should set TOGGLE_LOCK_ROOM, USER_DISCONNECT, USER_ENTER callbacks on socket when handleSocket is called', async () => {
    io.emit('connection', new MockConnectSocket());
    const darkwireSocket = new DarkwireSocket(makeTestSocketOPTS(socket));

    await darkwireSocket.handleSocket(socket);

    expect(
      ((socket as unknown) as MockConnectSocket).testObservers
    ).toHaveProperty('TOGGLE_LOCK_ROOM');

    expect(
      ((socket as unknown) as MockConnectSocket).testObservers
    ).toHaveProperty('USER_ENTER');

    expect(
      ((socket as unknown) as MockConnectSocket).testObservers
    ).toHaveProperty('USER_DISCONNECT');
  });
});
