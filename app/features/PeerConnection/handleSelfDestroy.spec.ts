// import handleSelfDestroy from './handleSelfDestroy';
// import {
//   TEST_ROOM_ID,
//   TEST_SHARING_SESSION_ID,
//   TEST_USER,
// } from './mocks/testVars';
// import PeerConnection from '.';
// import RoomIDService from '../../server/RoomIDService';
// import ConnectedDevicesService from '../ConnectedDevicesService';
// import SharingSessionService from '../SharingSessionService';
// import NullSimplePeer from './NullSimplePeer';
// import SharingSession from '../SharingSessionService/SharingSession';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');

// jest.mock('electron', () => {
//   return {
//     ipcRenderer: {
//       on: jest.fn(),
//       invoke: jest.fn(),
//     },
//   };
// });

// const TEST_PARTNER = {
//   username: 'asdfaf',
//   publicKey: 'afafdsg',
// };

// const TEST_PARTNER_DEVICE_ID = '123fdsad';
// const TEST_SHARING_SESSION = ({
//   destroy: jest.fn(),
//   setStatus: jest.fn(),
// } as unknown) as SharingSession;

// describe('handleSelfDestroy callback', () => {
//   // let sharingSessionService;
//   let peerConnection: PeerConnection;

//   beforeEach(() => {
//     peerConnection = new PeerConnection(
//       TEST_ROOM_ID,
//       TEST_SHARING_SESSION_ID,
//       TEST_USER,
//       ({
//         unmarkRoomIDAsTaken: jest.fn(),
//       } as unknown) as RoomIDService,
//       ({
//         removeDeviceByID: jest.fn(),
//       } as unknown) as ConnectedDevicesService,
//       ({
//         sharingSessions: {
//           get: () => TEST_SHARING_SESSION,
//           delete: jest.fn(),
//         },
//       } as unknown) as SharingSessionService,
//       {} as DesktopCapturerSourcesService
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when handleSelfDestroy callback called properly', () => {
//     it('should set peerConnection to other than it was', () => {
//       peerConnection.partner = TEST_PARTNER;

//       handleSelfDestroy(peerConnection);

//       expect(peerConnection.partner).not.toEqual(TEST_PARTNER);
//     });

//     it('should remove device from connectedDevicesService device id', () => {
//       peerConnection.partnerDeviceDetails.id = TEST_PARTNER_DEVICE_ID;

//       handleSelfDestroy(peerConnection);

//       expect(
//         peerConnection.connectedDevicesService.removeDeviceByID
//       ).toBeCalledWith(TEST_PARTNER_DEVICE_ID);
//     });

//     it('should call .destroy() on simple peer', () => {
//       peerConnection.peer = ({
//         destroy: jest.fn(),
//       } as unknown) as typeof NullSimplePeer;

//       handleSelfDestroy(peerConnection);

//       expect(peerConnection.peer.destroy).toBeCalled();
//     });

//     it('should stop all localStream tracks and set it to null', () => {
//       const testTrack1 = {
//         stop: jest.fn(),
//       };
//       const testTrack2 = {
//         stop: jest.fn(),
//       };
//       const TEST_LOCAL_STREAM = ({
//         getTracks: () => [testTrack1, testTrack2],
//       } as unknown) as MediaStream;
//       peerConnection.localStream = TEST_LOCAL_STREAM;

//       handleSelfDestroy(peerConnection);

//       expect(testTrack1.stop).toBeCalled();
//       expect(testTrack2.stop).toBeCalled();
//       expect(peerConnection.localStream).toBeNull();
//     });

//     it('should call sharingSession .destroy()', () => {
//       handleSelfDestroy(peerConnection);

//       expect(TEST_SHARING_SESSION.destroy).toBeCalled();
//     });

//     it('should delete sharing session from sharing session service', () => {
//       handleSelfDestroy(peerConnection);

//       expect(
//         peerConnection.sharingSessionService.sharingSessions.delete
//       ).toBeCalledWith(peerConnection.sharingSessionID);
//     });

//     it('should disconnect socket server', () => {
//       peerConnection.socket = ({
//         disconnect: jest.fn(),
//       } as unknown) as SocketIOClient.Socket;

//       handleSelfDestroy(peerConnection);

//       expect(peerConnection.socket.disconnect).toBeCalled();
//     });
//   });
// });
