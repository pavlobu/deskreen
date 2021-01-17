import { OUTPUTDeviceDetailsFromUAParsed } from './mocks/OUTPUTDeviceDetailsFromUAParsed';
import { INPUTtestWindowNavigatorUserAgent } from './mocks/INPUTtestWindowNavigatorUserAgent';
jest.mock('./setAndShowErrorDialogMessage');
// import SimplePeer from 'simple-peer';
import PeerConnection from '.';
// import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import PeerConnectionUIHandler from './PeerConnectionUIHandler';
import peerConnectionHandleSocket, {
  getMyIPCallback,
} from './peerConnectionHandleSocket';
import setAndShowErrorDialogMessage from './setAndShowErrorDialogMessage';
import PeerConnectionSocketNotDefined from './errors/PeerConnectionSocketNotDefined';

jest.useFakeTimers();

// jest.mock('.');
jest.mock('../../utils/crypto.ts');

const TEST_IP = '123.123.123.123';

describe('peerConnectionHandleSocket callback', () => {
  let peerConnection: PeerConnection;

  beforeEach(() => {
    peerConnection = new PeerConnection(
      '123',
      jest.fn(),
      new Crypto(),
      new VideoAutoQualityOptimizer(),
      new PeerConnectionUIHandler(
        true,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
      )
    );

    peerConnection.initApp = jest.fn();

    const listeners = new Map<string, any[]>();

    peerConnection.socket = {
      on: jest.fn().mockImplementation((s: string, callback: any) => {
        if (!listeners.has(s)) {
          listeners.set(s, []);
        }
        listeners.get(s)?.push(callback);
      }),
      emit: jest.fn().mockImplementation((s: string, any: any) => {
        listeners.forEach((callbacks, key) => {
          callbacks.forEach((callback) => {
            if (key === s) {
              callback(any);
            }
          });
        });
      }),
      io: {
        engine: {
          id: '434241'
        }
      }
    };

    peerConnection.receiveEncryptedMessage = jest.fn();
    peerConnection.sendEncryptedMessage = jest.fn();

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when peerConnectionHandleSocket is called with .socket undefined', () => {
    it('should throw an error', () => {
      peerConnection.socket = undefined;

      try {
        peerConnectionHandleSocket(peerConnection);
        fail('PeerConnectionSocketNotDefined should be thrown here');
      } catch (e) {
        expect(e).toEqual(new PeerConnectionSocketNotDefined());
      }
    });
  });

  describe('when peerConnectionHandleSocket is called properly', () => {
    describe('when socket.on("disconnect") occured', () => {
      it('should call setAndShowErrorDialogMessage to show user that they are disconnected', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('disconnect');

        expect(setAndShowErrorDialogMessage).toBeCalled();
      });
    });

    describe('when socket.on("connect") occured', () => {
      it('should call socket.emit("GET_MY_IP")', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('connect');

        jest.advanceTimersByTime(600);

        expect(peerConnection.socket.emit).toBeCalledWith(
          'GET_MY_IP',
          expect.anything()
        );
      });
    });

    describe('when socket.on("ENCRYPTED_MESSAGE") occured', () => {
      it('should call peerConnection receiveEncryptedMessage', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('ENCRYPTED_MESSAGE');

        expect(peerConnection.receiveEncryptedMessage).toBeCalled();
      });
    });

    describe('when socket.on("NOT_ALLOWED") occured', () => {
      it('should change UI accordingly', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('NOT_ALLOWED');

        expect(setAndShowErrorDialogMessage).toBeCalled();
      });
    });

    describe('when socket.on("ROOM_LOCKED") occured', () => {
      it('should change UI accordingly', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('ROOM_LOCKED');

        expect(setAndShowErrorDialogMessage).toBeCalled();
      });
    });

    describe('when socket.on("USER_ENTER") occured', () => {
      it('should call setMyDeviceDetails on UIHandler', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('USER_ENTER', {
          users: [{ username: 'asdf', publicKey: '1234' }],
        });

        jest.advanceTimersByTime(1000);

        expect(peerConnection.UIHandler.setMyDeviceDetails).toBeCalled();
      });

      it('should call sendEncryptedMessage with ADD_USER type', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('USER_ENTER', {
          users: [{ username: 'asdf', publicKey: '1234' }],
        });

        expect(peerConnection.sendEncryptedMessage).toBeCalledWith({
          type: 'ADD_USER',
          payload: expect.anything(),
        });
      });

      it('should call sendEncryptedMessage with DEVICE_DETAILS type', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('USER_ENTER', {
          users: [{ username: 'asdf', publicKey: '1234' }],
        });

        expect(peerConnection.sendEncryptedMessage).toBeCalledWith({
          type: 'DEVICE_DETAILS',
          payload: expect.anything(),
        });
      });

      it('should call sendEncryptedMessage with GET_APP_THEME type', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('USER_ENTER', {
          users: [{ username: 'asdf', publicKey: '1234' }],
        });

        expect(peerConnection.sendEncryptedMessage).toBeCalledWith({
          type: 'GET_APP_THEME',
          payload: expect.anything(),
        });
      });

      it('should call sendEncryptedMessage with GET_APP_LANGUAGE type', () => {
        peerConnectionHandleSocket(peerConnection);

        peerConnection.socket.emit('USER_ENTER', {
          users: [{ username: 'asdf', publicKey: '1234' }],
        });

        expect(peerConnection.sendEncryptedMessage).toBeCalledWith({
          type: 'GET_APP_LANGUAGE',
          payload: expect.anything(),
        });
      });

    });
  });

  describe('when getMyIPCallback is called properly', () => {
    it('should call initApp on peerConnection', () => {
      getMyIPCallback(
        peerConnection,
        TEST_IP,
        INPUTtestWindowNavigatorUserAgent
      );

      expect(peerConnection.initApp).toBeCalled();
    });

    it('should make peerConnection.myDeviceDetails with proper parameters', () => {
      getMyIPCallback(
        peerConnection,
        TEST_IP,
        INPUTtestWindowNavigatorUserAgent
      );

      expect(peerConnection.myDeviceDetails).toEqual(
        OUTPUTDeviceDetailsFromUAParsed
      );
    });
  });
});
