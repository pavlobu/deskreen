jest.mock('../../utils/message');
jest.mock('./setAndShowErrorDialogMessage');

import PeerConnection from '.';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import PeerConnectionUIHandler from './PeerConnectionUIHandler';
import peerConnectionReceiveEncryptedMessage from './peerConnectionReceiveEncryptedMessage';
import NullUser from './NullUser';
import PeerConnectionUserIsNotDefinedError from './errors/PeerConnectionUserIsNotDefinedError';
import SimplePeer from 'simple-peer';
import setAndShowErrorDialogMessage from './setAndShowErrorDialogMessage';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';

jest.useFakeTimers();

const TEST_USER = { username: 'asdf', publicKey: 'ff', privateKey: 'sss' };

const DUMMY_PAYLOAD = {
  payload: '',
  signature: '',
  iv: '',
  keys: [],
};

const CALL_USER_PAYLOAD = {
  payload: 'CALL_USER',
  signature: '',
  iv: '',
  keys: [],
};

const DENY_TO_CONNECT_PAYLOAD = {
  payload: 'DENY_TO_CONNECT',
  signature: '',
  iv: '',
  keys: [],
};

const DISCONNECT_BY_HOST_MACHINE_USER = {
  payload: 'DISCONNECT_BY_HOST_MACHINE_USER',
  signature: '',
  iv: '',
  keys: [],
};

const ALLOWED_TO_CONNECT_PAYLOAD = {
  payload: 'ALLOWED_TO_CONNECT',
  signature: '',
  iv: '',
  keys: [],
};

const APP_THEME_PAYLOAD = {
  payload: 'APP_THEME',
  signature: '',
  iv: '',
  keys: [],
};

const APP_LANGUAGE_PAYLOAD = {
  payload: 'APP_LANGUAGE',
  signature: '',
  iv: '',
  keys: [],
};

jest.mock('../../utils/message', () => {
  return {
    process: (payload: any) => {
      return new Promise<ProcessedMessage>((resolve) => {
        if (payload.payload === 'CALL_USER') {
          resolve({
            type: 'CALL_USER',
            payload: {
              signalData: '1signal',
            },
          });
        }
        if (payload.payload === 'DENY_TO_CONNECT') {
          resolve({
            type: 'DENY_TO_CONNECT',
            payload: {},
          });
        }
        if (payload.payload === 'DISCONNECT_BY_HOST_MACHINE_USER') {
          resolve({
            type: 'DISCONNECT_BY_HOST_MACHINE_USER',
            payload: {},
          });
        }
        if (payload.payload === 'ALLOWED_TO_CONNECT') {
          resolve({
            type: 'ALLOWED_TO_CONNECT',
            payload: {},
          });
        }
        if (payload.payload === 'APP_THEME') {
          resolve({
            type: 'APP_THEME',
            payload: {
              value: false,
            },
          });
        }
        if (payload.payload === 'APP_LANGUAGE') {
          resolve({
            type: 'APP_LANGUAGE',
            payload: {
              value: 'latin',
            },
          });
        }
        resolve();
      });
    },
  };
});

jest.mock('simple-peer', () => {
  return jest.fn().mockImplementation(() => {
    const listeners = new Map<string, any[]>();
    return {
      ...jest.requireActual('simple-peer'),
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
      send: jest.fn().mockImplementation((_: string) => {}),
      signal: jest.fn().mockImplementation((_: string) => {}),
    };
  });
});

describe('peerConnectionReceiveEncryptedMessage', () => {
  let peerConnection: PeerConnection;

  beforeEach(() => {
    jest.clearAllMocks();

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
    peerConnection.user = TEST_USER;
    peerConnection.peer = new SimplePeer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('when peerConnectionReceiveEncryptedMessage is called', () => {
    describe('when peerConnection.user is NullUser', () => {
      it('should throw and error', () => {
        peerConnection.user = NullUser;

        peerConnectionReceiveEncryptedMessage(
          peerConnection,
          DUMMY_PAYLOAD
        ).catch((e) => expect(e).toEqual(new PeerConnectionUserIsNotDefinedError()));
      });
    });

    describe('when processedMessageType is "CALL_USER"', () => {
      it('should call .signal on simple-peer', async () => {
        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          CALL_USER_PAYLOAD
        );
        jest.advanceTimersByTime(2000);

        expect(peerConnection.peer?.signal).toBeCalledWith('1signal');
      });
    });

    describe('when processedMessageType is "DENY_TO_CONNECT"', () => {
      it('should call setAndShowErrorDialogMessage with DENY_TO_CONNECT error', async () => {
        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          DENY_TO_CONNECT_PAYLOAD
        );

        expect(setAndShowErrorDialogMessage).toBeCalledWith(
          peerConnection,
          ErrorMessage.DENY_TO_CONNECT
        );
      });
    });

    describe('when processedMessageType is "DISCONNECT_BY_HOST_MACHINE_USER"', () => {
      it('should call setAndShowErrorDialogMessage with DISCONNECT_BY_HOST_MACHINE_USER error', async () => {
        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          DISCONNECT_BY_HOST_MACHINE_USER
        );

        expect(setAndShowErrorDialogMessage).toBeCalledWith(
          peerConnection,
          ErrorMessage.DISCONNECTED
        );
      });
    });

    describe('when processedMessageType is "ALLOWED_TO_CONNECT"', () => {
      it('should call setAndShowErrorDialogMessage with ALLOWED_TO_CONNECT error', async () => {
        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          ALLOWED_TO_CONNECT_PAYLOAD
        );

        expect(
          peerConnection.UIHandler.hostAllowedToConnectCallback
        ).toBeCalled();
      });
    });

    describe('when processedMessageType is "APP_THEME"', () => {
      it('should call setAndShowErrorDialogMessage with APP_THEME error', async () => {
        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          APP_THEME_PAYLOAD
        );

        expect(peerConnection.UIHandler.setIsDarkThemeCallback).toBeCalledWith(
          false
        );
        expect(peerConnection.UIHandler.isDarkTheme).toBe(false);
      });
    });

    describe('when processedMessageType is "APP_THEME" and current theme is the same as received', () => {
      it('should call setAndShowErrorDialogMessage with APP_LANGUAGE error', async () => {
        peerConnection.UIHandler.isDarkTheme = false;

        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          APP_LANGUAGE_PAYLOAD
        );

        expect(peerConnection.UIHandler.setIsDarkThemeCallback).not.toBeCalledWith(
          false
        );
        expect(peerConnection.UIHandler.isDarkTheme).toBe(false);
      });
    });

    describe('when processedMessageType is "APP_LANGUAGE"', () => {
      it('should call setAndShowErrorDialogMessage with APP_LANGUAGE error', async () => {
        await peerConnectionReceiveEncryptedMessage(
          peerConnection,
          APP_LANGUAGE_PAYLOAD
        );

        expect(peerConnection.UIHandler.setAppLanguageCallback).toBeCalledWith(
          'latin'
        );
      });
    });
  });
});
