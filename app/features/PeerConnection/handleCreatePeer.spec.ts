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
// import handleCreatePeer from './handleCreatePeer';
// import createDesktopCapturerStream from './createDesktopCapturerStream';
// import NullSimplePeer from './NullSimplePeer';
// import handlePeerOnData from './handlePeerOnData';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';

// jest.useFakeTimers();

// jest.mock('simple-peer');
// jest.mock('./createDesktopCapturerStream', () => {
//   return jest.fn();
// });
// jest.mock('./handlePeerOnData');

// const TEST_MOCK_LOCAL_STREAM = ({} as unknown) as MediaStream;

// function initPeerWithListeners(peerConnection: PeerConnection) {
//   const listeners: any = {};
//   peerConnection.peer = ({
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
//   } as unknown) as typeof NullSimplePeer;
// }

// describe('handleCreatePeer callback', () => {
//   let peerConnection: PeerConnection;

//   beforeEach(() => {
//     // @ts-ignore
//     createDesktopCapturerStream.mockImplementation(() => {
//       return new Promise((resolve) => resolve(TEST_MOCK_LOCAL_STREAM));
//     });
//     peerConnection = new PeerConnection(
//       TEST_ROOM_ID,
//       TEST_SHARING_SESSION_ID,
//       TEST_USER,
//       {} as RoomIDService,
//       {} as ConnectedDevicesService,
//       {} as SharingSessionService,
//       {} as DesktopCapturerSourcesService
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when handleCreatePeer called properly', () => {
//     it('should call createDesktopCapturerStream', async () => {
//       await handleCreatePeer(peerConnection);

//       expect(createDesktopCapturerStream).toBeCalled();
//     });

//     it('should make .peer defined', async () => {
//       await handleCreatePeer(peerConnection);

//       expect(peerConnection.peer).not.toEqual(NullSimplePeer);
//     });

//     it('should add localStream to peer with addStream', async () => {
//       peerConnection.localStream = TEST_MOCK_LOCAL_STREAM;

//       await handleCreatePeer(peerConnection);

//       expect(peerConnection.peer.addStream).toBeCalledWith(
//         TEST_MOCK_LOCAL_STREAM
//       );
//     });

//     it('should set .peer.on(signal event listner', async () => {
//       await handleCreatePeer(peerConnection);

//       expect(peerConnection.peer.on).toBeCalledWith(
//         'signal',
//         expect.anything()
//       );
//     });

//     it('should set .peer.on(data event listner', async () => {
//       await handleCreatePeer(peerConnection);

//       expect(peerConnection.peer.on).toBeCalledWith('data', expect.anything());
//     });

//     it('should resolve with undefined', async () => {
//       const res = await handleCreatePeer(peerConnection);

//       expect(res).toBe(undefined);
//     });

//     describe('when peer on "signal" even occured', () => {
//       it('should add signal to .signalsDataToCallUser', async () => {
//         const TEST_SIGNAL_DATA = '1234';
//         initPeerWithListeners(peerConnection);

//         await handleCreatePeer(peerConnection);

//         peerConnection.peer.emit('signal', TEST_SIGNAL_DATA);

//         expect(peerConnection.signalsDataToCallUser).toEqual([
//           TEST_SIGNAL_DATA,
//         ]);
//       });
//     });

//     describe('when peer on "data" even occured', () => {
//       it('should add signal to .signalsDataToCallUser', async () => {
//         const TEST_DATA = 'asdfasdfasdf';
//         initPeerWithListeners(peerConnection);

//         await handleCreatePeer(peerConnection);

//         peerConnection.peer.emit('data', TEST_DATA);

//         expect(handlePeerOnData).toBeCalled();
//       });
//     });
//   });
// });
