// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import { ipcRenderer } from 'electron';
// import PeerConnection from '.';
// import RoomIDService from '../../server/RoomIDService';
// import ConnectedDevicesService from '../ConnectedDevicesService';
// import SharingSessionService from '../SharingSessionService';
// import DesktopCapturerSourcesService from '../DesktopCapturerSourcesService';
// import {
//   TEST_ROOM_ID,
//   TEST_SHARING_SESSION_ID,
//   TEST_USER,
// } from './mocks/testVars';
// import setDisplaySizeFromLocalStream from './handleSetDisplaySizeFromLocalStream';
// import handleSelfDestroy from './handleSelfDestroy';
// import handleRecieveEncryptedMessage from './handleRecieveEncryptedMessage';
// import handleCreatePeer from './handleCreatePeer';
// import { prepare as prepareMessage } from '../../utils/message';
// import getAppLanguage from '../../utils/getAppLanguage';
// import getAppTheme from '../../utils/getAppTheme';

// jest.useFakeTimers();

// jest.mock('simple-peer');
// const TEST_SOURCE_DISPLAY_SIZE = {
//   width: 640,
//   height: 480,
// };
// const TEST_DATA_TO_SEND_IN_ENCRYPTED_MESSAGE = 'oji23oi12p34';
// jest.mock('electron', () => {
//   return {
//     ipcRenderer: {
//       invoke: jest.fn().mockImplementation(() => {
//         return TEST_SOURCE_DISPLAY_SIZE;
//       }),
//     },
//   };
// });
// jest.mock('./handleSetDisplaySizeFromLocalStream');
// jest.mock('./handleSelfDestroy');
// jest.mock('../../utils/message', () => {
//   return {
//     prepare: jest.fn().mockReturnValue({
//       toSend: TEST_DATA_TO_SEND_IN_ENCRYPTED_MESSAGE,
//     }),
//   };
// });
// jest.mock('./handleRecieveEncryptedMessage');
// jest.mock('./handleCreatePeer');

// const TEST_DISPLAY_ID = '21';

// describe('PeerConnection index.ts tests', () => {
//   let peerConnection: PeerConnection;
//   const mockGetSourceDisplayIDBySourceID = jest.fn().mockImplementation(() => {
//     return TEST_DISPLAY_ID;
//   });

//   beforeEach(() => {
//     peerConnection = new PeerConnection(
//       TEST_ROOM_ID,
//       TEST_SHARING_SESSION_ID,
//       TEST_USER,
//       {} as RoomIDService,
//       {} as ConnectedDevicesService,
//       {} as SharingSessionService,
//       ({} as unknown) as DesktopCapturerSourcesService
//     );
//     peerConnection.displayID = 'screen:123idid';
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('when PeerConnection constructor was called', () => {
//     it('should be created with internal properties correclty', () => {
//       expect(peerConnection.roomIDService).toBeDefined();
//       expect(peerConnection.connectedDevicesService).toBeDefined();
//       expect(peerConnection.sharingSessionService).toBeDefined();
//     });

//     describe('when notifyClientWithNewLanguage was called', () => {
//       it('should call sendEncryptedMessage with proper payload', () => {
//         peerConnection.sendEncryptedMessage = jest.fn();

//         peerConnection.notifyClientWithNewLanguage();

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith({
//           type: 'APP_LANGUAGE',
//           payload: { value: getAppLanguage() },
//         });
//       });
//     });

//     describe('when notifyClientWithNewColorTheme was called', () => {
//       it('should call sendEncryptedMessage with proper payload', () => {
//         peerConnection.sendEncryptedMessage = jest.fn();

//         peerConnection.notifyClientWithNewColorTheme();

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith({
//           type: 'APP_THEME',
//           payload: { value: getAppTheme() },
//         });
//       });
//     });

//     describe('when setDesktopCapturerSourceID was called', () => {
//       it('should set .desktopCapturerSourceID and call other callbacks', () => {
//         const testSourceID = 'screen:asdfsffs1234';
//         process.env.RUN_MODE = 'dev';
//         peerConnection.setDisplayIDByDesktopCapturerSourceID = jest.fn();
//         peerConnection.handleCreatePeerAfterDesktopCapturerSourceIDWasSet = jest.fn();

//         peerConnection.setDesktopCapturerSourceID(testSourceID);

//         process.env.RUN_MODE = 'test';
//         expect(peerConnection.desktopCapturerSourceID).toBe(testSourceID);
//         expect(
//           peerConnection.setDisplayIDByDesktopCapturerSourceID
//         ).toBeCalled();
//         expect(
//           peerConnection.handleCreatePeerAfterDesktopCapturerSourceIDWasSet
//         ).toBeCalled();
//       });
//     });

//     describe('when setDisplayIDByDesktopCapturerSourceID was called', () => {
//       describe('when desktopCapture source id is screen', () => {
//         it('should set .desktopCapturerSourceID and call other callbacks', () => {
//           peerConnection.desktopCapturerSourceID = 'screen:asdfa2';
//           peerConnection.setDisplaySizeRetreivedFromMainProcess = jest.fn();
//           peerConnection.desktopCapturerSourcesService = ({
//             getSourceDisplayIDBySourceID: mockGetSourceDisplayIDBySourceID,
//           } as unknown) as DesktopCapturerSourcesService;

//           peerConnection.setDisplayIDByDesktopCapturerSourceID();

//           expect(
//             peerConnection.setDisplaySizeRetreivedFromMainProcess
//           ).toBeCalled();
//           expect(mockGetSourceDisplayIDBySourceID).toBeCalled();
//           expect(peerConnection.displayID).toBe(TEST_DISPLAY_ID);
//         });
//       });

//       describe('when desktopCapture source id is window', () => {
//         it('should not set anything', () => {
//           peerConnection.desktopCapturerSourceID = 'window:asdfa2';
//           peerConnection.setDisplaySizeRetreivedFromMainProcess = jest.fn();
//           peerConnection.desktopCapturerSourcesService = ({
//             getSourceDisplayIDBySourceID: mockGetSourceDisplayIDBySourceID,
//           } as unknown) as DesktopCapturerSourcesService;

//           peerConnection.setDisplayIDByDesktopCapturerSourceID();

//           expect(
//             peerConnection.setDisplaySizeRetreivedFromMainProcess
//           ).not.toBeCalled();
//           expect(mockGetSourceDisplayIDBySourceID).not.toBeCalled();
//           expect(peerConnection.displayID).not.toBe(TEST_DISPLAY_ID);
//         });
//       });
//     });

//     describe('when setDisplaySizeRetreivedFromMainProcess was called', () => {
//       it('should call .invoke on ipcRenderer with proper parameters', async () => {
//         await peerConnection.setDisplaySizeRetreivedFromMainProcess();

//         expect(ipcRenderer.invoke).toBeCalledWith(
//           'get-display-size-by-display-id',
//           peerConnection.displayID
//         );
//         expect(peerConnection.sourceDisplaySize).toBe(TEST_SOURCE_DISPLAY_SIZE);
//       });

//       describe('when .invoke returned "undefined"', () => {
//         it('should not set sourceDisplaySize', async () => {
//           // @ts-ignore
//           ipcRenderer.invoke.mockImplementation(() => {
//             return 'undefined';
//           });

//           await peerConnection.setDisplaySizeRetreivedFromMainProcess();

//           expect(ipcRenderer.invoke).toBeCalledWith(
//             'get-display-size-by-display-id',
//             peerConnection.displayID
//           );
//           expect(peerConnection.sourceDisplaySize).not.toBe(
//             TEST_SOURCE_DISPLAY_SIZE
//           );
//         });
//       });
//     });

//     describe('when handleCreatePeerAfterDesktopCapturerSourceIDWasSet was called', () => {
//       describe('when .sourceDisplaySize is defined', () => {
//         it('should call setDisplaySizeFromLocalStream', async () => {
//           peerConnection.createPeer = jest.fn();
//           peerConnection.sourceDisplaySize = TEST_SOURCE_DISPLAY_SIZE;

//           await peerConnection.handleCreatePeerAfterDesktopCapturerSourceIDWasSet();

//           expect(peerConnection.createPeer).toBeCalled();
//           expect(setDisplaySizeFromLocalStream).not.toBeCalled();
//         });
//       });

//       describe('when .sourceDisplaySize is NOT defined', () => {
//         it('should call setDisplaySizeFromLocalStream', async () => {
//           peerConnection.createPeer = jest.fn();

//           await peerConnection.handleCreatePeerAfterDesktopCapturerSourceIDWasSet();

//           expect(peerConnection.createPeer).toBeCalled();
//           expect(setDisplaySizeFromLocalStream).toBeCalled();
//         });
//       });
//     });

//     describe('when setOnDeviceConnectedCallback was called properly', () => {
//       it('should set onDeviceConnectedCallback', () => {
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const testCallback = (_: Device) => {};
//         peerConnection.setOnDeviceConnectedCallback(testCallback);

//         expect(peerConnection.onDeviceConnectedCallback).toBe(testCallback);
//       });
//     });

//     describe('when denyConnectionForPartner was called properly', () => {
//       it('should call sendEncryptedMessage with proper payload and call .disconnectPartner', async () => {
//         const testPayload = {
//           type: 'DENY_TO_CONNECT',
//           payload: {},
//         };
//         peerConnection.sendEncryptedMessage = jest.fn();
//         peerConnection.disconnectPartner = jest.fn();

//         await peerConnection.denyConnectionForPartner();

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith(testPayload);
//         expect(peerConnection.disconnectPartner).toBeCalled();
//       });
//     });

//     describe('when sendUserAllowedToConnect was called properly', () => {
//       it('should call sendEncryptedMessage with proper payload', () => {
//         const testPayload = {
//           type: 'ALLOWED_TO_CONNECT',
//           payload: {},
//         };
//         peerConnection.sendEncryptedMessage = jest.fn();

//         peerConnection.sendUserAllowedToConnect();

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith(testPayload);
//       });
//     });

//     describe('when disconnectByHostMachineUser was called properly', () => {
//       it('should call sendEncryptedMessage with proper payload and call .disconnectPartner and .selfDestroy', async () => {
//         const testPayload = {
//           type: 'DISCONNECT_BY_HOST_MACHINE_USER',
//           payload: {},
//         };
//         peerConnection.sendEncryptedMessage = jest.fn();
//         peerConnection.disconnectPartner = jest.fn();
//         peerConnection.selfDestroy = jest.fn();

//         await peerConnection.disconnectByHostMachineUser();

//         expect(peerConnection.sendEncryptedMessage).toBeCalledWith(testPayload);
//         expect(peerConnection.disconnectPartner).toBeCalled();
//         expect(peerConnection.selfDestroy).toBeCalled();
//       });
//     });

//     describe('when disconnectPartner was called properly', () => {
//       it('should call sendEncryptedMessage with proper payload', () => {
//         const testEmitData = {
//           ip: peerConnection.partnerDeviceDetails.deviceIP,
//         };
//         peerConnection.socket = ({
//           emit: jest.fn(),
//         } as unknown) as SocketIOClient.Socket;

//         peerConnection.disconnectPartner();

//         expect(peerConnection.socket.emit).toBeCalledWith(
//           'DISCONNECT_SOCKET_BY_DEVICE_IP',
//           testEmitData
//         );
//         expect(peerConnection.partnerDeviceDetails).toEqual({});
//       });
//     });

//     describe('when selfDestroy was called', () => {
//       it('should call handleSelfDestroy', () => {
//         peerConnection.selfDestroy();

//         expect(handleSelfDestroy).toBeCalled();
//       });
//     });

//     describe('when emitUserEnter was called', () => {
//       describe('when .socket is defined', () => {
//         it('should call socket emit with proper parameters', () => {
//           const testEmitData = {
//             username: peerConnection.user.username,
//             publicKey: peerConnection.user.publicKey,
//           };
//           peerConnection.socket = ({
//             emit: jest.fn(),
//           } as unknown) as SocketIOClient.Socket;

//           peerConnection.emitUserEnter();

//           expect(peerConnection.socket.emit).toBeCalledWith(
//             'USER_ENTER',
//             testEmitData
//           );
//         });
//       });
//     });

//     describe('when sendEncryptedMessage was called', () => {
//       describe('when it was NOT called properly', () => {
//         it('should not call "prepare" from message.ts if socket is not defined', () => {
//           peerConnection.socket = (undefined as unknown) as SocketIOClient.Socket;

//           peerConnection.sendEncryptedMessage(
//             ({} as unknown) as SendEncryptedMessagePayload
//           );

//           expect(prepareMessage).not.toBeCalled();
//         });

//         it('should not call "prepare" from message.ts if user is not defined', () => {
//           peerConnection.user = (undefined as unknown) as LocalPeerUser;

//           peerConnection.sendEncryptedMessage(
//             ({} as unknown) as SendEncryptedMessagePayload
//           );

//           expect(prepareMessage).not.toBeCalled();
//         });

//         it('should not call "prepare" from message.ts if partner is not defined', () => {
//           peerConnection.partner = (undefined as unknown) as LocalPeerUser;

//           peerConnection.sendEncryptedMessage(
//             ({} as unknown) as SendEncryptedMessagePayload
//           );

//           expect(prepareMessage).not.toBeCalled();
//         });
//       });

//       describe('when it was called properly', () => {
//         it('should call "prepare" from message.ts and .socket.emit(ENCRYPTED_MESSAGE', async () => {
//           const testPayload = ({} as unknown) as SendEncryptedMessagePayload;
//           peerConnection.socket = ({
//             emit: jest.fn(),
//           } as unknown) as SocketIOClient.Socket;
//           peerConnection.partner = TEST_USER;

//           await peerConnection.sendEncryptedMessage(testPayload);

//           expect(prepareMessage).toBeCalledWith(
//             testPayload,
//             TEST_USER,
//             TEST_USER
//           );
//           expect(peerConnection.socket.emit).toBeCalledWith(
//             'ENCRYPTED_MESSAGE',
//             TEST_DATA_TO_SEND_IN_ENCRYPTED_MESSAGE
//           );
//         });
//       });
//     });

//     describe('when receiveEncryptedMessage was called', () => {
//       describe('when peerConnection user is NOT defined', () => {
//         it('should NOT call handleRecieveEncryptedMessage', () => {
//           const testPayload = {} as ReceiveEncryptedMessagePayload;
//           peerConnection.user = (undefined as unknown) as LocalPeerUser;

//           peerConnection.receiveEncryptedMessage(testPayload);

//           expect(handleRecieveEncryptedMessage).not.toBeCalled();
//         });
//       });

//       describe('when peerConnection user is defined', () => {
//         it('should call handleRecieveEncryptedMessage', () => {
//           const testPayload = {} as ReceiveEncryptedMessagePayload;

//           peerConnection.receiveEncryptedMessage(testPayload);

//           expect(handleRecieveEncryptedMessage).toBeCalled();
//         });
//       });
//     });

//     describe('when callPeer was called', () => {
//       describe('when it was called when call already started', () => {
//         it('should NOT call .sendEncryptedMessage', () => {
//           process.env.RUN_MODE = 'dev';
//           peerConnection.isCallStarted = true;
//           peerConnection.sendEncryptedMessage = jest.fn();
//           peerConnection.signalsDataToCallUser = ['asdfasdf'];

//           peerConnection.callPeer();

//           process.env.RUN_MODE = 'test';
//           expect(peerConnection.sendEncryptedMessage).not.toBeCalled();
//         });
//       });

//       describe('when it was called when call NOT started', () => {
//         it('should call .sendEncryptedMessage', () => {
//           process.env.RUN_MODE = 'dev';
//           peerConnection.sendEncryptedMessage = jest.fn();
//           peerConnection.signalsDataToCallUser = ['asdfasdf'];

//           peerConnection.callPeer();

//           process.env.RUN_MODE = 'test';
//           expect(peerConnection.sendEncryptedMessage).toBeCalled();
//         });
//       });
//     });

//     describe('when createPeer was called', () => {
//       it('should call handleCreatePeer callback', () => {
//         peerConnection.createPeer();

//         expect(handleCreatePeer).toBeCalled();
//       });
//     });
//   });
// });
