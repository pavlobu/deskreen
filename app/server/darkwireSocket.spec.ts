/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Io from 'socket.io';
import http from 'http';
import Koa from 'koa';
import DarkwireSocket from './darkwireSocket';
import getStore from './store';
import MemoryStore from './store/MemoryStore';
import socketsIPService from './socketsIPService';
import socketIOServerStore from './store/socketIOServerStore';

jest.useFakeTimers();

jest.mock('./store', () => {
  let store: MemoryStore;
  return {
    __esModule: true, // this property makes it work
    default: () => {
      if (store) {
        return store;
      }
      store = ({
        set: jest.fn(),
        del: jest.fn(),
      } as unknown) as MemoryStore;
      return store;
    },
  };
});
jest.mock('./socketsIPService', () => {
  return {
    __esModule: true, // this property makes it work
    default: {
      getSocketIPByID: jest.fn(),
      getSocketIDByIP: jest.fn(),
    },
  };
});
jest.mock('./store/socketIOServerStore.ts', () => {
  const mockEmit = jest.fn();
  const mockedIO = {
    sockets: {
      connected: {},
    },
    to: jest.fn().mockImplementation(() => ({
      emit: mockEmit,
    })),
  };
  return {
    getServer: () => mockedIO,
  };
});

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

  let app: Koa<Koa.DefaultState, Koa.DefaultContext>;
  let server: http.Server;
  let io: Io.Server;
  let socket: Io.Socket;
  let socketToEmitMock: jest.Mock;

  const testRemoteAddress = '123.221.123.121';

  const makeTestDarkwireSocketOPTS = () => {
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

  beforeEach(() => {
    socketToEmitMock = jest.fn();
    // @ts-ignore
    // DarkwireSocket.mockClear();

    // // @ts-ignore
    // DarkwireSocket.mockImplementation(jest.requireActual('./darkwireSocket'));

    app = new Koa();
    server = protocol.createServer(app.callback());
    io = Io(server, {
      pingInterval: 20000,
      pingTimeout: 5000,
      serveClient: false,
    });

    io.on('connection', (receivedSocket) => {
      socket = receivedSocket;
      socket.emit = jest.fn();
      socket.on = jest.fn();
      socket.join = jest.fn().mockImplementation((_, callback) => {
        callback();
      });
      socket.to = jest.fn().mockImplementation(() => ({
        emit: socketToEmitMock,
      }));
      socket.disconnect = jest.fn();
      socket.request = {
        connection: {
          remoteAddress: testRemoteAddress,
        },
      };
    });

    if (socket) {
      // @ts-ignore
      socket.on.mockClear();
      // @ts-ignore
      socket.emit.mockClear();
      // @ts-ignore
      socket.join.mockClear();
      // @ts-ignore
      socket.to.mockClear();
      // @ts-ignore
      socket.disconnect.mockClear();
    }

    // @ts-ignore
    getStore().set.mockClear();
    // @ts-ignore
    getStore().del.mockClear();
    // @ts-ignore
    socketsIPService.getSocketIDByIP.mockClear();
    // @ts-ignore
    socketsIPService.getSocketIPByID.mockClear();

    // @ts-ignore
    socketIOServerStore.getServer().to().emit.mockClear();
    // @ts-ignore
    socketIOServerStore.getServer().to.mockClear();
  });

  describe('when DarkwireSocket is created with options properly', () => {
    it('should set internal socket same as passed in constructor', () => {
      io.emit('connection', {
        join: () => {},
      });
      const customSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());

      expect(customSocket.socket).toBe(socket);
    });

    it('should call .joinRoom() and pass roomId as argument', () => {
      const testSocketOPTS = makeTestDarkwireSocketOPTS();
      const { roomId } = testSocketOPTS;

      new DarkwireSocket(testSocketOPTS);

      expect(socket.join).toBeCalledWith(roomId, expect.anything());
    });

    describe('when room.isLocked', () => {
      it('should call .sendRoomLocked() in constructor()', () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());
        darkwireSocket.sendRoomLocked = jest.fn();
        const socketOptions = makeTestDarkwireSocketOPTS();
        socketOptions.room.isLocked = true;

        darkwireSocket.constructor(socketOptions);

        expect(darkwireSocket.sendRoomLocked).toBeCalled();
      });

      it('should NOT call .init() in constructor()', () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());
        darkwireSocket.sendRoomLocked = jest.fn();
        darkwireSocket.init = jest.fn();
        const socketOptions = makeTestDarkwireSocketOPTS();
        socketOptions.room.isLocked = true;

        darkwireSocket.constructor(socketOptions);

        expect(darkwireSocket.init).not.toBeCalled();
      });
    });

    describe('when .sendRoomLocked() is called', () => {
      it('should emit "ROOM_LOCKED" on internal socket object', () => {
        const customSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());

        customSocket.sendRoomLocked();

        expect(socket.emit).toBeCalledWith('ROOM_LOCKED');
      });
    });

    describe('when socket.on("disconnect") happened', () => {
      it('should call handleDisconnect', async () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());
        darkwireSocket.handleDisconnect = jest.fn();
        darkwireSocket.handleSocket();
        // @ts-ignore
        const disconnectCallback = socket.on.mock.calls[7][1];

        disconnectCallback();

        expect(darkwireSocket.handleDisconnect).toBeCalled();
      });
    });

    describe('when .init() is called', () => {
      it('should call .handleSocket', async () => {
        const testOpts = makeTestDarkwireSocketOPTS();
        const darkwireSocket = new DarkwireSocket(testOpts);
        darkwireSocket.handleSocket = jest.fn();
        darkwireSocket.joinRoom = jest
          .fn()
          .mockReturnValue(new Promise((resolve) => resolve(undefined)));

        await darkwireSocket.init();

        expect(darkwireSocket.handleSocket).toBeCalled();
      });
    });

    describe('when .handleSocket() is called', () => {
      it('should set socket.on event listeners', () => {
        io.emit('connection', new MockConnectSocket());
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());

        darkwireSocket.handleSocket();

        expect(socket.on).toHaveBeenCalledWith('GET_MY_IP', expect.anything());
        expect(socket.on).toHaveBeenCalledWith(
          'GET_IP_BY_SOCKET_ID',
          expect.anything()
        );
        expect(socket.on).toHaveBeenCalledWith(
          'IS_ROOM_LOCKED',
          expect.anything()
        );
        expect(socket.on).toHaveBeenCalledWith(
          'ENCRYPTED_MESSAGE',
          expect.anything()
        );
        expect(socket.on).toHaveBeenCalledWith(
          'DISCONNECT_SOCKET_BY_DEVICE_IP',
          expect.anything()
        );
        expect(socket.on).toHaveBeenCalledWith('USER_ENTER', expect.anything());
        expect(socket.on).toHaveBeenCalledWith(
          'TOGGLE_LOCK_ROOM',
          expect.anything()
        );
        expect(socket.on).toHaveBeenCalledWith('disconnect', expect.anything());
        expect(socket.on).toHaveBeenCalledWith(
          'USER_DISCONNECT',
          expect.anything()
        );
      });
    });

    describe('when .saveRoom() is called', () => {
      it('should store room to store', async () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());
        const testRoom = {
          id: '123',
          users: [],
          isLocked: false,
          createdAt: 1234512,
        };

        await darkwireSocket.saveRoom(testRoom);

        expect(getStore().set).toHaveBeenCalledWith(
          'rooms',
          darkwireSocket.roomId,
          expect.anything()
        );
      });
    });

    describe('when .destroyRoom() is called', () => {
      it('should delete room from store', async () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());

        await darkwireSocket.destroyRoom();

        expect(getStore().del).toHaveBeenCalledWith(
          'rooms',
          darkwireSocket.roomId
        );
      });
    });

    describe('when .fetchRoom() is called', () => {
      it('whould return res from getStore().get or {}', async () => {
        const testRoomJSON = { asdf: '234' };
        const testRoom = JSON.stringify(testRoomJSON);
        const roomStore = getStore();
        roomStore.get = jest
          .fn()
          .mockReturnValue(new Promise((resolve) => resolve(testRoom)));
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());

        const res1 = await darkwireSocket.fetchRoom();

        expect(roomStore.get).toHaveBeenCalled();
        expect(res1).toEqual(testRoomJSON);

        roomStore.get = jest
          .fn()
          .mockReturnValue(new Promise((resolve) => resolve(undefined)));
        const res2 = await darkwireSocket.fetchRoom();

        expect(roomStore.get).toHaveBeenCalled();
        expect(res2).toEqual({});
      });
    });

    describe('when .joinRoom() is called', () => {
      it('should resolve', async () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());

        const res = await darkwireSocket.joinRoom();

        expect(res).toBe(undefined);
      });

      describe('when error passed in join callback', () => {
        it('should reject', async () => {
          socket.join = jest.fn().mockImplementation((_, callback) => {
            callback(new Error('ugly error'));
          });
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );

          try {
            // rejects with undefined here
            await darkwireSocket.joinRoom();
            // eslint-disable-next-line jest/no-jasmine-globals
            fail(); // should have rejected here
          } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e).toBe(undefined);
          }
        });
      });
    });

    describe('after .handleSocket() call all listeners are set', () => {
      describe('when socket.on("GET_MY_IP" callback occured', () => {
        it('should call acknowledgeFunction with proper ip', () => {
          const testIP = '123.231.121.111';
          // @ts-ignore
          socketsIPService.getSocketIPByID.mockImplementationOnce(() => testIP);
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          darkwireSocket.handleSocket();
          // @ts-ignore
          const getMyIpCallback = darkwireSocket.socket.on.mock.calls[0][1];
          const acknowledgeFunctionMock = jest.fn();

          getMyIpCallback(acknowledgeFunctionMock);

          expect(acknowledgeFunctionMock).toBeCalledWith(testIP);
        });
      });

      describe('when socket.on("GET_IP_BY_SOCKET_ID" callback occured', () => {
        it('should call acknowledgeFunction with proper ip', () => {
          const testIP = '123.231.121.111';
          // @ts-ignore
          socketsIPService.getSocketIPByID.mockImplementationOnce(() => testIP);
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          darkwireSocket.handleSocket();
          const getMyIpBySocketIdCallback =
            // @ts-ignore
            darkwireSocket.socket.on.mock.calls[1][1];
          const acknowledgeFunctionMock = jest.fn();

          getMyIpBySocketIdCallback(undefined, acknowledgeFunctionMock);

          expect(acknowledgeFunctionMock).toBeCalledWith(testIP);
        });
      });

      describe('when socket.on("IS_ROOM_LOCKED" callback occured', () => {
        it('should call acknowledgeFunction with room.isLocked', async () => {
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          darkwireSocket.handleSocket();
          const testIsRoomLocked = true;
          const testRoom = {
            id: 'string',
            users: [],
            isLocked: testIsRoomLocked,
            createdAt: 1234132,
          };
          const isRoomLockedCallback =
            // @ts-ignore
            darkwireSocket.socket.on.mock.calls[2][1];
          darkwireSocket.fetchRoom = jest
            .fn()
            .mockReturnValue(new Promise((resolve) => resolve(testRoom)));
          const acknowledgeFunctionMock = jest.fn();

          await isRoomLockedCallback(acknowledgeFunctionMock);

          expect(acknowledgeFunctionMock).toBeCalledWith(testIsRoomLocked);
        });
      });

      describe('when socket.on("ENCRYPTED_MESSAGE" callback occured', () => {
        it('should call emit ENCRYPTED_MESSAGE to current roomId', () => {
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          darkwireSocket.handleSocket();
          const testPayload = {
            asd: '2gasd',
          };
          const encryptedMessageCallback =
            // @ts-ignore
            darkwireSocket.socket.on.mock.calls[3][1];

          encryptedMessageCallback(testPayload);

          expect(socket.to).toBeCalledWith(darkwireSocket.roomId);
          expect(socketToEmitMock).toBeCalledWith(
            'ENCRYPTED_MESSAGE',
            testPayload
          );
        });
      });

      describe('when socket.on("DISCONNECT_SOCKET_BY_DEVICE_IP" callback occured', () => {
        describe('when called by room owner', () => {
          describe('when socket id to disconnect is found', () => {
            it('should call .handleDisconnect with proper socket', async () => {
              const testSocketID = 'stringId123';
              const testRoom = {
                users: [
                  {
                    socketId: testSocketID,
                    isOwner: true,
                  },
                ],
                isLocked: true,
                createdAt: 1234132,
              };
              // @ts-ignore
              socketsIPService.getSocketIDByIP.mockImplementationOnce(
                () => testSocketID
              );
              const darkwireSocket = new DarkwireSocket(
                makeTestDarkwireSocketOPTS()
              );
              darkwireSocket.handleDisconnect = jest.fn();
              darkwireSocket.socket.id = testSocketID;
              darkwireSocket.handleSocket();
              darkwireSocket.fetchRoom = jest
                .fn()
                .mockReturnValue(new Promise((resolve) => resolve(testRoom)));
              const testPayloadIPToSuccess = '132.213.123.123';
              const testPayload = {
                ip: testPayloadIPToSuccess,
              };
              const disconnectSocketByDeviceIpCallback =
                // @ts-ignore
                darkwireSocket.socket.on.mock.calls[4][1];
              const testSocket = ({
                socketToDisconnect: 'asdfasdf',
              } as unknown) as Io.Socket;
              socketIOServerStore.getServer().sockets.connected[
                testSocketID
              ] = testSocket;

              await disconnectSocketByDeviceIpCallback(testPayload);

              expect(darkwireSocket.handleDisconnect).toBeCalledWith(
                testSocket
              );
              delete socketIOServerStore.getServer().sockets.connected[
                testSocketID
              ];
            });
          });

          describe('when socket id to disconnect is NOT found', () => {
            it('should NOT call .handleDisconnect()', async () => {
              const testSocketID = 'stringId123';
              const testRoom = {
                users: [
                  {
                    socketId: testSocketID,
                    isOwner: true,
                  },
                ],
                isLocked: true,
                createdAt: 1234132,
              };
              // @ts-ignore
              socketsIPService.getSocketIDByIP.mockImplementationOnce(
                () => undefined // should return undefined here to simulate expected behavior for test
              );
              const darkwireSocket = new DarkwireSocket(
                makeTestDarkwireSocketOPTS()
              );
              darkwireSocket.handleDisconnect = jest.fn();
              darkwireSocket.socket.id = testSocketID;
              darkwireSocket.handleSocket();
              darkwireSocket.fetchRoom = jest
                .fn()
                .mockReturnValue(new Promise((resolve) => resolve(testRoom)));
              const testPayloadIPToSuccess = '132.213.123.123';
              const testPayload = {
                ip: testPayloadIPToSuccess,
              };
              const disconnectSocketByDeviceIpCallback =
                // @ts-ignore
                darkwireSocket.socket.on.mock.calls[4][1];

              await disconnectSocketByDeviceIpCallback(testPayload);

              expect(darkwireSocket.handleDisconnect).not.toBeCalled();
            });
          });
        });

        describe('when called by NOT a room owner', () => {
          it('should NOT call socketsIPService.getSocketIDByIP(payload.ip) and .handleDisconnect()', async () => {
            const testSocketID = 'stringId123';
            const testRoom = {
              users: [
                {
                  socketId: testSocketID,
                  isOwner: false, // NOT owner!! this should be false always here to make test succeed
                },
              ],
              isLocked: true,
              createdAt: 1234132,
            };
            const darkwireSocket = new DarkwireSocket(
              makeTestDarkwireSocketOPTS()
            );
            darkwireSocket.handleDisconnect = jest.fn();
            darkwireSocket.socket.id = testSocketID;
            darkwireSocket.handleSocket();
            darkwireSocket.fetchRoom = jest
              .fn()
              .mockReturnValue(new Promise((resolve) => resolve(testRoom)));
            const testPayloadIPToSuccess = '132.213.123.123';
            const testPayload = {
              ip: testPayloadIPToSuccess,
            };
            const disconnectSocketByDeviceIpCallback =
              // @ts-ignore
              darkwireSocket.socket.on.mock.calls[4][1];

            await disconnectSocketByDeviceIpCallback(testPayload);

            expect(socketsIPService.getSocketIDByIP).not.toBeCalled();
            expect(darkwireSocket.handleDisconnect).not.toBeCalled();
          });
        });

        describe('when .fetchRoom returned with NO users', () => {
          it('should NOT call socketsIPService.getSocketIDByIP(payload.ip) and .handleDisconnect()', async () => {
            const testSocketID = 'stringId123';
            const testRoom = {
              users: undefined, // this should simulate condition for test
              isLocked: true,
              createdAt: 1234132,
            };
            const darkwireSocket = new DarkwireSocket(
              makeTestDarkwireSocketOPTS()
            );
            darkwireSocket.handleDisconnect = jest.fn();
            darkwireSocket.socket.id = testSocketID;
            darkwireSocket.handleSocket();
            darkwireSocket.fetchRoom = jest
              .fn()
              .mockReturnValue(new Promise((resolve) => resolve(testRoom)));
            const testPayloadIPToSuccess = '132.213.123.123';
            const testPayload = {
              ip: testPayloadIPToSuccess,
            };
            const disconnectSocketByDeviceIpCallback =
              // @ts-ignore
              darkwireSocket.socket.on.mock.calls[4][1];

            await disconnectSocketByDeviceIpCallback(testPayload);

            expect(socketsIPService.getSocketIDByIP).not.toBeCalled();
            expect(darkwireSocket.handleDisconnect).not.toBeCalled();
          });
        });
      });

      describe('when socket.on("USER_ENTER" callback occured', () => {
        describe('when .fetchRoom returned empty room, like this -> {}', () => {
          it('should call .saveRoom() and socketIOServerStore.getServer().to(roomId).emit("USER_ENTER"', async () => {
            const darkwireSocket = new DarkwireSocket(
              makeTestDarkwireSocketOPTS()
            );
            darkwireSocket.handleSocket();
            darkwireSocket.fetchRoom = () =>
              new Promise((resolve) => resolve({}));
            const userEnterCallback =
              // @ts-ignore
              darkwireSocket.socket.on.mock.calls[5][1];
            const testPayload = { publicKey: 'sdie2', ip: '123.123.123.123' };
            darkwireSocket.saveRoom = jest
              .fn()
              .mockReturnValue(new Promise((resolve) => resolve(undefined)));

            await userEnterCallback(testPayload);

            expect(darkwireSocket.saveRoom).toHaveBeenCalled();
            expect(socketIOServerStore.getServer().to).toBeCalledWith(
              darkwireSocket.roomId
            );
            expect(
              socketIOServerStore.getServer().to('1234').emit
            ).toHaveBeenCalledWith('USER_ENTER', expect.anything());
          });
        });

        describe('when .fetchRoom NOT empty room', () => {
          describe('if user already exists in room', () => {
            it('should NOT call .saveRoom() and NOT call socketIOServerStore.getServer().to(roomId).emit("USER_ENTER"', async () => {
              const darkwireSocket = new DarkwireSocket(
                makeTestDarkwireSocketOPTS()
              );
              const testUserPublicKey = 'sdie2';
              const testUser = {
                publicKey: testUserPublicKey,
              };
              const testRoom = {
                id: darkwireSocket.roomId,
                users: [testUser],
                isLocked: false,
                createdAt: Date.now(),
              };
              darkwireSocket.handleSocket();
              darkwireSocket.fetchRoom = () =>
                new Promise((resolve) => resolve(testRoom));
              const userEnterCallback =
                // @ts-ignore
                darkwireSocket.socket.on.mock.calls[5][1];
              const testPayload = {
                publicKey: testUserPublicKey,
                ip: '123.123.123.123',
              };
              darkwireSocket.saveRoom = jest
                .fn()
                .mockReturnValue(new Promise((resolve) => resolve(undefined)));

              await userEnterCallback(testPayload);

              expect(darkwireSocket.saveRoom).not.toHaveBeenCalled();
              expect(socketIOServerStore.getServer().to).not.toBeCalled();
              expect(
                socketIOServerStore.getServer().to('1234').emit
              ).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe('when socket.on("TOGGLE_LOCK_ROOM" callback occured', () => {
        describe('when user is owner, who called toggle lock room', () => {
          it('should call .saveRoom()', async () => {
            const darkwireSocket = new DarkwireSocket(
              makeTestDarkwireSocketOPTS()
            );
            const testSocketID = '43132sd';
            const testUser = {
              socketId: testSocketID,
              isOwner: true,
            };
            const isTestRoomLocked = false;
            const testRoom = {
              id: darkwireSocket.roomId,
              users: [testUser],
              isLocked: isTestRoomLocked,
              createdAt: Date.now(),
            };
            darkwireSocket.handleSocket();
            darkwireSocket.socket.id = testSocketID;
            darkwireSocket.fetchRoom = () =>
              new Promise((resolve) => resolve(testRoom));
            darkwireSocket.saveRoom = jest
              .fn()
              .mockImplementation(
                () => new Promise((resolve) => resolve(undefined))
              );
            const toggleLockRoomCallback =
              // @ts-ignore
              darkwireSocket.socket.on.mock.calls[6][1];

            await toggleLockRoomCallback();

            expect(darkwireSocket.saveRoom).toBeCalledWith({
              ...testRoom,
              isLocked: !isTestRoomLocked,
            });
          });
        });

        describe('when user is not owner, who called toggle lock room', () => {
          it('should not call .saveRoom', async () => {
            const darkwireSocket = new DarkwireSocket(
              makeTestDarkwireSocketOPTS()
            );
            const testSocketID = '43132sd';
            const testUser = {
              socketId: testSocketID,
              isOwner: false,
            };
            const isTestRoomLocked = false;
            const testRoom = {
              id: darkwireSocket.roomId,
              users: [testUser],
              isLocked: isTestRoomLocked,
              createdAt: Date.now(),
            };
            darkwireSocket.handleSocket();
            darkwireSocket.socket.id = testSocketID;
            darkwireSocket.fetchRoom = () =>
              new Promise((resolve) => resolve(testRoom));
            darkwireSocket.saveRoom = jest
              .fn()
              .mockImplementation(
                () => new Promise((resolve) => resolve(undefined))
              );
            const toggleLockRoomCallback =
              // @ts-ignore
              darkwireSocket.socket.on.mock.calls[6][1];

            await toggleLockRoomCallback();

            expect(darkwireSocket.saveRoom).not.toBeCalled();
          });
        });
      });

      describe('when socket.on("USER_DISCONNECT" callback occured', () => {
        it('should call .handleDisconnect with proper socket object', () => {
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          darkwireSocket.handleSocket();
          darkwireSocket.handleDisconnect = jest.fn();
          const userDisconnectCallback =
            // @ts-ignore
            darkwireSocket.socket.on.mock.calls[8][1];

          userDisconnectCallback();

          expect(darkwireSocket.handleDisconnect).toBeCalledWith(
            darkwireSocket.socket
          );
        });
      });
    });

    describe('when .handleDisconnect() was called', () => {
      describe('when it was called by room owner (aka. localhost)', () => {
        it('should call socket.disconnect(), disconnectAllUsers(), .destroyRoom(), socketIOServerStore.getServer().to(this.roomId).emit("USER_EXIT"', async () => {
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          const testSocketID = '43132sd';
          const testUser = {
            socketId: testSocketID,
            isOwner: true, // AN OWNER!!! required for this test condition
          };
          const testRoom = {
            id: darkwireSocket.roomId,
            users: [testUser],
            isLocked: false,
            createdAt: Date.now(),
          };
          darkwireSocket.socket.id = testSocketID;
          darkwireSocket.fetchRoom = () =>
            new Promise((resolve) => resolve(testRoom));
          darkwireSocket.disconnectAllUsers = jest.fn();
          darkwireSocket.destroyRoom = jest
            .fn()
            .mockImplementation(
              () => new Promise((resolve) => resolve(undefined))
            );

          await darkwireSocket.handleDisconnect(darkwireSocket.socket);

          expect(darkwireSocket.destroyRoom).toBeCalled();
          expect(darkwireSocket.disconnectAllUsers).toBeCalled();
          expect(socketIOServerStore.getServer().to).toBeCalledWith(
            darkwireSocket.roomId
          );
          expect(socketIOServerStore.getServer().to('').emit).toBeCalledWith(
            'USER_EXIT',
            expect.anything()
          );
          expect(darkwireSocket.socket.disconnect).toBeCalled();
        });
      });

      describe('when it was called by NOT room owner (aka. client)', () => {
        it('should call .saveRoom, socket.disconnect(), socketIOServerStore.getServer().to(this.roomId).emit("USER_EXIT", newRoom.users)', async () => {
          const darkwireSocket = new DarkwireSocket(
            makeTestDarkwireSocketOPTS()
          );
          const testSocketID = '43132sd';
          const testUser = {
            socketId: testSocketID,
            isOwner: false, // NOT AN OWNER!!! required for this test condition
          };
          const testRoom = {
            id: darkwireSocket.roomId,
            users: [testUser],
            isLocked: false,
            createdAt: Date.now(),
          };
          darkwireSocket.socket.id = testSocketID;
          darkwireSocket.fetchRoom = () =>
            new Promise((resolve) => resolve(testRoom));
          darkwireSocket.saveRoom = jest
            .fn()
            .mockImplementation(
              () => new Promise((resolve) => resolve(undefined))
            );

          await darkwireSocket.handleDisconnect(darkwireSocket.socket);

          expect(darkwireSocket.saveRoom).toBeCalled();
          expect(socketIOServerStore.getServer().to).toBeCalledWith(
            darkwireSocket.roomId
          );
          expect(socketIOServerStore.getServer().to('').emit).toBeCalledWith(
            'USER_EXIT',
            expect.anything()
          );
          expect(darkwireSocket.socket.disconnect).toBeCalled();
        });
      });
    });

    describe('when .disconnectAllUsers() was called', () => {
      it('should call disconnect all connected users to socket', () => {
        const darkwireSocket = new DarkwireSocket(makeTestDarkwireSocketOPTS());
        const testSocketID1 = '43132sd';
        const testSocketID2 = '43132sd222';
        const testUser1 = {
          socketId: testSocketID1,
          isOwner: false,
        };
        const testUser2 = {
          socketId: testSocketID2,
          isOwner: false,
        };
        const testRoom = {
          id: darkwireSocket.roomId,
          users: [testUser1, testUser2],
          isLocked: false,
          createdAt: Date.now(),
        };
        const getIOBackupConnected = socketIOServerStore.getServer().sockets
          .connected;
        socketIOServerStore.getServer().sockets.connected = {
          // @ts-ignore
          [testSocketID1]: { disconnect: jest.fn() },
          // @ts-ignore
          [testSocketID2]: { disconnect: jest.fn() },
        };

        darkwireSocket.disconnectAllUsers((testRoom as unknown) as Room);

        expect(
          socketIOServerStore.getServer().sockets.connected[testSocketID1]
            .disconnect
        ).toBeCalled();
        expect(
          socketIOServerStore.getServer().sockets.connected[testSocketID2]
            .disconnect
        ).toBeCalled();

        socketIOServerStore.getServer().sockets.connected = getIOBackupConnected;
      });
    });
  });
});
