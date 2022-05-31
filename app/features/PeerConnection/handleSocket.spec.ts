// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import {
//   TEST_ROOM_ID,
//   TEST_SHARING_SESSION_ID,
//   TEST_USER,
// } from './mocks/testVars';
// import PeerConnection from '.';
// import RoomIDService from '../../server/RoomIDService';
// import ConnectedDevicesService from '../ConnectedDevicesService';
// import SharingSessionService from '../SharingSessionService';
// import handleSocket from './handleSocket';
// import handleSocketUserEnter from './handleSocketUserEnter';
// import handleSocketUserExit from './handleSocketUserExit';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');
// jest.mock('./handleSocketUserEnter');
// jest.mock('./handleSocketUserExit');

// function initSocketWithListeners(peerConnection: PeerConnection) {
//   const listeners: any = {};
//   peerConnection.socket = ({
//     on: (eventName: string, callback: (p: any) => void) => {
//       if (!listeners[eventName]) {
//         listeners[eventName] = [];
//       }
//       listeners[eventName].push(callback);
//     },
//     emit: (eventName: string, param: any) => {
//       if (listeners[eventName]) {
//         listeners[eventName].forEach((callback: (p: any) => void) => {
//           callback(param);
//         });
//       }
//     },
//     removeAllListeners: () => {},
//   } as unknown) as SocketIOClient.Socket;
// }

// describe('handleSocket callback', () => {
//   let peerConnection: PeerConnection;

//   beforeEach(() => {
//     // @ts-ignore
//     peerConnection = new PeerConnection(
//       TEST_ROOM_ID,
//       TEST_SHARING_SESSION_ID,
//       TEST_USER,
//       {} as RoomIDService,
//       {} as ConnectedDevicesService,
//       {} as SharingSessionService,
//       {} as DesktopCapturerSourcesService
//     );
//     peerConnection.socket = ({
//       on: jest.fn(),
//       removeAllListeners: jest.fn(),
//     } as unknown) as SocketIOClient.Socket;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when handleSocket called properly', () => {
//     it('should call removeAllListeners', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.removeAllListeners).toBeCalled();
//     });

//     it('should call socket.on(connect', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.on).toBeCalledWith(
//         'connect',
//         expect.anything()
//       );
//     });

//     it('should call socket.on(disconnect', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.on).toBeCalledWith(
//         'disconnect',
//         expect.anything()
//       );
//     });

//     it('should call socket.on(USER_ENTER', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.on).toBeCalledWith(
//         'USER_ENTER',
//         expect.anything()
//       );
//     });

//     it('should call socket.on(USER_EXIT', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.on).toBeCalledWith(
//         'USER_EXIT',
//         expect.anything()
//       );
//     });

//     it('should call socket.on(ENCRYPTED_MESSAGE', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.on).toBeCalledWith(
//         'ENCRYPTED_MESSAGE',
//         expect.anything()
//       );
//     });

//     it('should call socket.on(USER_DISCONNECT', () => {
//       handleSocket(peerConnection);

//       expect(peerConnection.socket.on).toBeCalledWith(
//         'USER_DISCONNECT',
//         expect.anything()
//       );
//     });

//     describe('when ENCRYPTED_MESSAGE event occured', () => {
//       it('should call receiveEncryptedMessage on peer connection object with proper payload', () => {
//         peerConnection.receiveEncryptedMessage = jest.fn();
//         const TEST_ENCRYPTED_MESSAGE_PAYLOAD = {
//           test: 'sfss',
//         };
//         initSocketWithListeners(peerConnection);

//         handleSocket(peerConnection);
//         peerConnection.socket.emit(
//           'ENCRYPTED_MESSAGE',
//           TEST_ENCRYPTED_MESSAGE_PAYLOAD
//         );

//         expect(peerConnection.receiveEncryptedMessage).toBeCalledWith(
//           TEST_ENCRYPTED_MESSAGE_PAYLOAD
//         );
//       });
//     });

//     describe('when USER_DISCONNECT event occured', () => {
//       it('should call .socket.emit with TOGGLE_LOCK_ROOM event', () => {
//         peerConnection.toggleLockRoom = jest.fn();
//         initSocketWithListeners(peerConnection);

//         handleSocket(peerConnection);
//         peerConnection.socket.emit('USER_DISCONNECT');

//         expect(peerConnection.toggleLockRoom).toBeCalledWith(false);
//       });
//     });

//     describe('when USER_ENTER event occured', () => {
//       it('should call handleSocketUserEnter callback', () => {
//         initSocketWithListeners(peerConnection);

//         handleSocket(peerConnection);
//         peerConnection.socket.emit('USER_ENTER');

//         expect(handleSocketUserEnter).toBeCalled();
//       });
//     });

//     describe('when USER_EXIT event occured', () => {
//       it('should call handleSocketUserEnter callback', () => {
//         initSocketWithListeners(peerConnection);

//         handleSocket(peerConnection);
//         peerConnection.socket.emit('USER_EXIT');

//         expect(handleSocketUserExit).toBeCalled();
//       });
//     });

//     describe('when "disconnect" event occured', () => {
//       it('should call .selfDestrory() callback', () => {
//         peerConnection.selfDestroy = jest.fn();
//         initSocketWithListeners(peerConnection);

//         handleSocket(peerConnection);
//         peerConnection.socket.emit('disconnect');

//         expect(peerConnection.selfDestroy).toBeCalled();
//       });
//     });
//   });
// });
