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
// import DesktopCapturerSourceType from '../DesktopCapturerSourcesService/DesktopCapturerSourceType';
// import createDesktopCapturerStream from './createDesktopCapturerStream';
// import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');
// jest.mock('./getDesktopSourceStreamBySourceID', () => {
//   return jest.fn();
// });

// const MOCK_MEDIA_STREAM = ({} as unknown) as MediaStream;
// const TEST_SCREEN_SOURCE_ID = 'screen:1234fa';
// const TEST_WINDOW_SOURCE_ID = 'window:1234fa';
// const TEST_DISPLAY_SIZE = { width: 640, height: 480 };

// describe('createDesktopCapturerStream callback', () => {
//   let peerConnection: PeerConnection;

//   beforeEach(() => {
//     // @ts-ignore
//     getDesktopSourceStreamBySourceID.mockReturnValueOnce(MOCK_MEDIA_STREAM);
//     process.env.RUN_MODE = 'dev';
//     peerConnection = new PeerConnection(
//       TEST_ROOM_ID,
//       TEST_SHARING_SESSION_ID,
//       TEST_USER,
//       {} as RoomIDService,
//       {} as ConnectedDevicesService,
//       {} as SharingSessionService,
//       {} as DesktopCapturerSourcesService
//     );
//     peerConnection.desktopCapturerSourceID = DesktopCapturerSourceType.SCREEN;
//   });

//   afterEach(() => {
//     process.env.RUN_MODE = 'test';
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when createDesktopCapturerStream called properly', () => {
//     describe('when source type is screen', () => {
//       it('should call getDesktopSourceStreamBySourceID with proper parameters and set localStream', async () => {
//         peerConnection.sourceDisplaySize = { width: 640, height: 480 };

//         await createDesktopCapturerStream(
//           peerConnection,
//           TEST_SCREEN_SOURCE_ID
//         );

//         expect(getDesktopSourceStreamBySourceID).toBeCalledWith(
//           TEST_SCREEN_SOURCE_ID,
//           TEST_DISPLAY_SIZE.width,
//           TEST_DISPLAY_SIZE.height,
//           0.5,
//           1
//         );

//         expect(peerConnection.localStream).toBe(MOCK_MEDIA_STREAM);
//       });
//     });

//     describe('when source type is window', () => {
//       it('should call getDesktopSourceStreamBySourceID with proper parameters and set localStream', async () => {
//         await createDesktopCapturerStream(
//           peerConnection,
//           TEST_WINDOW_SOURCE_ID
//         );

//         expect(getDesktopSourceStreamBySourceID).toBeCalledWith(
//           TEST_WINDOW_SOURCE_ID
//         );

//         expect(peerConnection.localStream).toBe(MOCK_MEDIA_STREAM);
//       });
//     });
//   });
// });
