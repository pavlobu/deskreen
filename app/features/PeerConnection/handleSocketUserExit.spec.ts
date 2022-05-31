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
// import handleSocketUserExit from './handleSocketUserExit';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');

// describe('handleSocketUserExit callback', () => {
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

//   describe('when handleSocketUserExit called properly', () => {
//     it('should call toggleLockRoom and selfDestroy', () => {
//       peerConnection.isSocketRoomLocked = true;
//       peerConnection.isCallStarted = true;
//       peerConnection.toggleLockRoom = jest.fn();
//       peerConnection.selfDestroy = jest.fn();

//       handleSocketUserExit(peerConnection);

//       expect(peerConnection.toggleLockRoom).toBeCalledWith(false);
//       expect(peerConnection.selfDestroy).toBeCalled();
//     });
//   });
// });
