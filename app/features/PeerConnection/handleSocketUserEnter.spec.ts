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
// import handleSocketUserEnter from './handleSocketUserEnter';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');

// const TEST_PARTNER_USER = {
//   username: 'asdfasdf',
//   publicKey: 'key:asdfasdffff',
// };
// const TEST_PAYLOAD = {
//   users: [TEST_PARTNER_USER],
// };

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

// describe('handleSocketUserEnter callback', () => {
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
//     initSocketWithListeners(peerConnection);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when handleSocketUserEnter called properly', () => {
//     it('should set .partner to partner user', () => {
//       handleSocketUserEnter(peerConnection, TEST_PAYLOAD);

//       expect(peerConnection.partner).toBe(TEST_PARTNER_USER);
//     });

//     it('should call toggleLockRoom with true', () => {
//       peerConnection.toggleLockRoom = jest.fn();

//       handleSocketUserEnter(peerConnection, TEST_PAYLOAD);

//       expect(peerConnection.toggleLockRoom).toBeCalledWith(true);
//     });

//     it('should call emitUserEnter with true', () => {
//       peerConnection.emitUserEnter = jest.fn();

//       handleSocketUserEnter(peerConnection, TEST_PAYLOAD);

//       expect(peerConnection.emitUserEnter).toBeCalled();
//     });
//   });
// });
