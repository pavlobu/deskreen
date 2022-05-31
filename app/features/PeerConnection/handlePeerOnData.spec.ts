// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import handlePeerOnData from './handlePeerOnData';
// import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';

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
// import NullSimplePeer from './NullSimplePeer';
// import prepareDataMessageToSendScreenSourceType from './prepareDataMessageToSendScreenSourceType';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');
// jest.mock('./getDesktopSourceStreamBySourceID', () => {
//   return jest.fn();
// });

// const TEST_DATA_SET_VIDEO_QUALITY_05 = `
// {
//   "type": "set_video_quality",
//   "payload": {
//     "value": 0.5
//   }
// }
// `;

// const TEST_DATA_GET_SHARING_SOURCE_TYPE = `
// {
//   "type": "get_sharing_source_type",
//   "payload": {
//   }
// }
// `;

// describe('handlePeerOnData callback', () => {
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
//     peerConnection.desktopCapturerSourceID = DesktopCapturerSourceType.SCREEN;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when handlePeerOnData called properly', () => {
//     describe('when handlePeerOnData called with set_video_quality data and when sharing source is SCREEN', () => {
//       it('should create new stream', () => {
//         handlePeerOnData(peerConnection, TEST_DATA_SET_VIDEO_QUALITY_05);

//         expect(getDesktopSourceStreamBySourceID).toBeCalled();
//       });

//       it('should call replaceTrack() on peer', async () => {
//         // @ts-ignore
//         getDesktopSourceStreamBySourceID.mockImplementation(
//           () =>
//             (({
//               getVideoTracks: () => [{ stop: jest.fn() }],
//             } as unknown) as MediaStream)
//         );
//         peerConnection.localStream = ({
//           getVideoTracks: () => [{ stop: jest.fn() }],
//         } as unknown) as MediaStream;
//         peerConnection.peer = ({
//           replaceTrack: jest.fn(),
//         } as unknown) as typeof NullSimplePeer;
//         await handlePeerOnData(peerConnection, TEST_DATA_SET_VIDEO_QUALITY_05);

//         expect(peerConnection.peer.replaceTrack).toBeCalled();
//       });

//       it('should call .stop() on old track to clear memory', async () => {
//         // @ts-ignore
//         getDesktopSourceStreamBySourceID.mockImplementation(
//           () =>
//             (({
//               getVideoTracks: () => [{ stop: jest.fn() }],
//             } as unknown) as MediaStream)
//         );
//         const oldTrackStopFunctionMock = jest.fn();
//         peerConnection.localStream = ({
//           getVideoTracks: () => [{ stop: oldTrackStopFunctionMock }],
//         } as unknown) as MediaStream;
//         peerConnection.peer = ({
//           replaceTrack: jest.fn(),
//         } as unknown) as typeof NullSimplePeer;

//         await handlePeerOnData(peerConnection, TEST_DATA_SET_VIDEO_QUALITY_05);

//         expect(oldTrackStopFunctionMock).toBeCalled();
//       });
//     });

//     describe('when handlePeerOnData called with set_video_quality data and when sharing source is WINDOW', () => {
//       it('should NOT create new stream', () => {
//         peerConnection.desktopCapturerSourceID =
//           DesktopCapturerSourceType.WINDOW;
//         handlePeerOnData(peerConnection, TEST_DATA_SET_VIDEO_QUALITY_05);

//         expect(getDesktopSourceStreamBySourceID).not.toBeCalled();
//       });

//       it('should NOT call replaceTrack() on peer', async () => {
//         peerConnection.desktopCapturerSourceID =
//           DesktopCapturerSourceType.WINDOW;
//         // @ts-ignore
//         getDesktopSourceStreamBySourceID.mockImplementation(
//           () =>
//             (({
//               getVideoTracks: () => [{ stop: jest.fn() }],
//             } as unknown) as MediaStream)
//         );
//         peerConnection.localStream = ({
//           getVideoTracks: () => [{ stop: jest.fn() }],
//         } as unknown) as MediaStream;
//         peerConnection.peer = ({
//           replaceTrack: jest.fn(),
//         } as unknown) as typeof NullSimplePeer;

//         await handlePeerOnData(peerConnection, TEST_DATA_SET_VIDEO_QUALITY_05);

//         expect(peerConnection.peer.replaceTrack).not.toBeCalled();
//       });

//       it('should NOT call .stop() on old track to clear memory', async () => {
//         peerConnection.desktopCapturerSourceID =
//           DesktopCapturerSourceType.WINDOW;
//         // @ts-ignore
//         getDesktopSourceStreamBySourceID.mockImplementation(
//           () =>
//             (({
//               getVideoTracks: () => [{ stop: jest.fn() }],
//             } as unknown) as MediaStream)
//         );
//         const oldTrackStopFunctionMock = jest.fn();
//         peerConnection.localStream = ({
//           getVideoTracks: () => [{ stop: oldTrackStopFunctionMock }],
//         } as unknown) as MediaStream;
//         peerConnection.peer = ({
//           replaceTrack: jest.fn(),
//         } as unknown) as typeof NullSimplePeer;

//         await handlePeerOnData(peerConnection, TEST_DATA_SET_VIDEO_QUALITY_05);

//         expect(oldTrackStopFunctionMock).not.toBeCalled();
//       });
//     });

//     describe('when handlePeerOnData called with get_sharing_source_type data', () => {
//       describe('when sharing source type is SCREEN', () => {
//         it('should call peer.send() with proper data', () => {
//           peerConnection.peer = ({
//             send: jest.fn(),
//           } as unknown) as typeof NullSimplePeer;

//           handlePeerOnData(peerConnection, TEST_DATA_GET_SHARING_SOURCE_TYPE);

//           expect(peerConnection.peer.send).toBeCalledWith(
//             prepareDataMessageToSendScreenSourceType(
//               DesktopCapturerSourceType.SCREEN
//             )
//           );
//         });
//       });

//       describe('when sharing source type is WINDOW', () => {
//         it('should call peer.send() with proper data', () => {
//           peerConnection.desktopCapturerSourceID =
//             DesktopCapturerSourceType.WINDOW;
//           peerConnection.peer = ({
//             send: jest.fn(),
//           } as unknown) as typeof NullSimplePeer;

//           handlePeerOnData(peerConnection, TEST_DATA_GET_SHARING_SOURCE_TYPE);

//           expect(peerConnection.peer.send).toBeCalledWith(
//             prepareDataMessageToSendScreenSourceType(
//               DesktopCapturerSourceType.WINDOW
//             )
//           );
//         });
//       });
//     });
//   });
// });
