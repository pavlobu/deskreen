// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import uuid from 'uuid';
// import {
//   TEST_ROOM_ID,
//   TEST_SHARING_SESSION_ID,
//   TEST_USER,
// } from './mocks/testVars';
// import PeerConnection from '.';
// import RoomIDService from '../../server/RoomIDService';
// import ConnectedDevicesService from '../ConnectedDevicesService';
// import SharingSessionService from '../SharingSessionService';
// import { process as processMessage } from '../../utils/message';
// import NullSimplePeer from './NullSimplePeer';
// import handleRecieveEncryptedMessage, {
//   handleDeviceIPMessage,
// } from './handleRecieveEncryptedMessage';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';
// import getAppTheme from '../../utils/getAppTheme';
// import getAppLanguage from '../../utils/getAppLanguage';

// jest.useFakeTimers();

// jest.mock('simple-peer');
// jest.mock('../../utils/message', () => {
//   return { process: jest.fn() };
// });
// jest.mock('uuid', () => {
//   return {
//     v4: () => '1234kdkd',
//   };
// });

// const TEST_DEVICE_DETAILS_PAYLOAD = {
//   socketID: '123',
//   deviceType: 'computer',
//   os: 'Windows',
//   browser: 'Chrome 72',
//   deviceScreenWidth: 640,
//   deviceScreenHeight: 480,
// };

// const TEST_DUMMY_ENCRYPTED_MESSAGE_PAYLOAD = ({
//   fromSocketID: '2411',
// } as unknown) as ReceiveEncryptedMessagePayload;

// describe('handleRecieveEncryptedMessage.ts', () => {
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
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when handleRecieveEncryptedMessage called properly', () => {
//     describe('when processed message type is CALL_ACCEPTED', () => {
//       it('should call peer.signal() with proper signal data', async () => {
//         const TEST_SIGNAL_DATA = 'a32sdlf';
//         // @ts-ignore
//         processMessage.mockImplementation(() => {
//           return {
//             type: 'CALL_ACCEPTED',
//             payload: {
//               signalData: TEST_SIGNAL_DATA,
//             },
//           };
//         });
//         peerConnection.peer = ({
//           signal: jest.fn(),
//         } as unknown) as typeof NullSimplePeer;

//         await handleRecieveEncryptedMessage(
//           peerConnection,
//           TEST_DUMMY_ENCRYPTED_MESSAGE_PAYLOAD
//         );

//         expect(peerConnection.peer.signal).toBeCalledWith(TEST_SIGNAL_DATA);
//       });
//     });

//     describe('when processed message type is DEVICE_DETAILS', () => {
//       it('should call socket.emit() to get partner device IP', async () => {
//         peerConnection.socket = ({
//           emit: jest.fn(),
//         } as unknown) as SocketIOClient.Socket;

//         // @ts-ignore
//         processMessage.mockImplementation(() => {
//           return {
//             type: 'DEVICE_DETAILS',
//             payload: TEST_DEVICE_DETAILS_PAYLOAD,
//           };
//         });

//         await handleRecieveEncryptedMessage(
//           peerConnection,
//           TEST_DUMMY_ENCRYPTED_MESSAGE_PAYLOAD
//         );

//         expect(peerConnection.socket.emit).toBeCalledWith(
//           'GET_IP_BY_SOCKET_ID',
//           expect.anything(),
//           expect.anything()
//         );
//       });
//     });

//     describe('when processed message type is GET_APP_THEME', () => {
//       it('should call .sendEncryptedMessage with proper payload', async () => {
//         peerConnection.sendEncryptedMessage = jest.fn();
//         const TEST_GET_APP_THEME_PAYLOAD = {
//           type: 'APP_THEME',
//           payload: { value: getAppTheme() },
//         };
//         // @ts-ignore
//         processMessage.mockImplementation(() => {
//           return {
//             type: 'GET_APP_THEME',
//             payload: {},
//           };
//         });

//         await handleRecieveEncryptedMessage(
//           peerConnection,
//           TEST_DUMMY_ENCRYPTED_MESSAGE_PAYLOAD
//         );

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith(
//           TEST_GET_APP_THEME_PAYLOAD
//         );
//       });
//     });

//     describe('when processed message type is GET_APP_LANGUAGE', () => {
//       it('should call .sendEncryptedMessage with proper payload', async () => {
//         peerConnection.sendEncryptedMessage = jest.fn();
//         const TEST_GET_APP_LANGUAGE_PAYLOAD = {
//           type: 'APP_LANGUAGE',
//           payload: { value: getAppLanguage() },
//         };
//         // @ts-ignore
//         processMessage.mockImplementation(() => {
//           return {
//             type: 'GET_APP_LANGUAGE',
//             payload: {},
//           };
//         });

//         await handleRecieveEncryptedMessage(
//           peerConnection,
//           TEST_DUMMY_ENCRYPTED_MESSAGE_PAYLOAD
//         );

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith(
//           TEST_GET_APP_LANGUAGE_PAYLOAD
//         );
//       });
//     });
//   });

//   describe('when handleDeviceIPMessage was called properly', () => {
//     it('should set partnerDeviceDetails with message payload and call device connected callback', async () => {
//       const TEST_DEVICE_IP = '123.123.123.123';
//       const TEST_DEVICE_TO_BE_SET = {
//         deviceIP: TEST_DEVICE_IP,
//         deviceType: TEST_DEVICE_DETAILS_PAYLOAD.deviceType,
//         deviceOS: TEST_DEVICE_DETAILS_PAYLOAD.os,
//         deviceBrowser: TEST_DEVICE_DETAILS_PAYLOAD.browser,
//         deviceScreenWidth: TEST_DEVICE_DETAILS_PAYLOAD.deviceScreenWidth,
//         deviceScreenHeight: TEST_DEVICE_DETAILS_PAYLOAD.deviceScreenHeight,
//         sharingSessionID: peerConnection.sharingSessionID,
//         id: uuid.v4(),
//       };
//       peerConnection.onDeviceConnectedCallback = jest.fn();
//       handleDeviceIPMessage(TEST_DEVICE_IP, peerConnection, {
//         type: 'DEVICE_DETAILS',
//         payload: TEST_DEVICE_DETAILS_PAYLOAD,
//       });

//       expect(peerConnection.partnerDeviceDetails).toEqual(
//         TEST_DEVICE_TO_BE_SET
//       );
//       expect(peerConnection.onDeviceConnectedCallback).toBeCalledWith(
//         TEST_DEVICE_TO_BE_SET
//       );
//     });
//   });
// });
