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
// import setDisplaySizeFromLocalStream from './handleSetDisplaySizeFromLocalStream';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');

// const TEST_MOCK_DISPLAY_SIZE = {
//   width: 1280,
//   height: 640,
// };

// describe('setDisplaySizeFromLocalStream callback', () => {
//   let peerConnection: PeerConnection;

//   beforeEach(() => {
//     peerConnection = new PeerConnection(
//       TEST_ROOM_ID,
//       TEST_SHARING_SESSION_ID,
//       TEST_USER,
//       {} as RoomIDService,
//       {} as ConnectedDevicesService,
//       {} as SharingSessionService,
//       {} as DesktopCapturerSourcesService
//     );
//     peerConnection.localStream = ({
//       getVideoTracks: () => [
//         {
//           getSettings: () => {
//             return TEST_MOCK_DISPLAY_SIZE;
//           },
//         },
//       ],
//     } as unknown) as MediaStream;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when setDisplaySizeFromLocalStream called properly', () => {
//     it('should set width and height on .sourceDisplaySize', () => {
//       setDisplaySizeFromLocalStream(peerConnection);

//       expect(peerConnection.sourceDisplaySize).toEqual(TEST_MOCK_DISPLAY_SIZE);
//     });
//   });

//   describe('when setDisplaySizeFromLocalStream was NOT called properly', () => {
//     describe('when localStream is null', () => {
//       it('should have .sourceDisplaySize as undefined', () => {
//         peerConnection.localStream = null;

//         setDisplaySizeFromLocalStream(peerConnection);

//         expect(peerConnection.sourceDisplaySize).toBe(undefined);
//       });
//     });

//     describe('when peerConnection.localStream.getVideoTracks()[0].getSettings() width or height is undefined', () => {
//       it('should have .sourceDisplaySize to be undefined', () => {
//         peerConnection.localStream = ({
//           getVideoTracks: () => [
//             {
//               getSettings: () => {
//                 return {
//                   width: undefined,
//                   height: undefined,
//                 };
//               },
//             },
//           ],
//         } as unknown) as MediaStream;

//         setDisplaySizeFromLocalStream(peerConnection);

//         expect(peerConnection.sourceDisplaySize).toBe(undefined);
//       });
//     });
//   });
// });
