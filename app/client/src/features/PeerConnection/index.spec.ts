jest.useFakeTimers();

jest.mock('../../utils/crypto.ts');
jest.mock('../VideoAutoQualityOptimizer');
jest.mock('simple-peer');
jest.mock('./setAndShowErrorDialogMessage');
jest.mock('./peerConnectionReceiveEncryptedMessage');

import SimplePeer from 'simple-peer';
import PeerConnection from '.';
import { VIDEO_QUALITY_TO_DECIMAL } from '../../constants/appConstants';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import { VideoQuality } from '../VideoAutoQualityOptimizer/VideoQualityEnum';
import NullUser from './NullUser';
import PeerConnectionPartnerIsNotDefinedError from './errors/PeerConnectionPartnerIsNotDefinedError';
import PeerConnectionSocketNotDefined from './errors/PeerConnectionSocketNotDefined';
import PeerConnectionUIHandler from './PeerConnectionUIHandler';
import PeerConnectionUserIsNotDefinedError from './errors/PeerConnectionUserIsNotDefinedError';
import setAndShowErrorDialogMessage from './setAndShowErrorDialogMessage';
import { prepareDataMessageToChangeQuality } from './simplePeerDataMessages';
import peerConnectionReceiveEncryptedMessage from './peerConnectionReceiveEncryptedMessage';

const SEND_ENCRYPTED_MESSAGE_DUMMY_PAYLOAD = {
  type: 'DUMMY_MESSAGE',
  payload: {},
};

const RECEIVE_ENCRYPTED_MESSAGE_DUMMY_PAYLOAD = {
  payload: '',
  signature: '',
  iv: '',
  keys: [{ sessionKey: '', signingKey: '' }],
};

describe('PeerConnection class', () => {
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
    peerConnection.peer = new SimplePeer();
    peerConnection.peer.send = jest.fn();

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
    };

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when new PeerConnection is created with not corrent roomId', () => {
    it('should change UI accordingly and notify user that error occured', () => {
      peerConnection = new PeerConnection(
        '',
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

      expect(setAndShowErrorDialogMessage).toBeCalled();
    });
  });

  describe('when new PeerConnection was created properly', () => {
    describe('when setVideoQuality is called properly', () => {
      it('should set video quality properly', () => {
        peerConnection.videoQualityChangedCallback = jest.fn();
        const newVideoQuality = VideoQuality.Q_100_PERCENT;
        peerConnection.setVideoQuality(newVideoQuality);

        expect(peerConnection.videoQualityChangedCallback).toBeCalled();
        expect(peerConnection.videoQuality).toBe(newVideoQuality);
      });
    });

    describe('when videoQualityChangedCallback is called and videoQuality of peer is VideoQuality.Q_AUTO', () => {
      it('should call peerConnection.peer.send with proper message', () => {
        peerConnection.videoQuality = VideoQuality.Q_AUTO;
        peerConnection.videoQualityChangedCallback();

        expect(peerConnection.peer?.send).toBeCalledWith(
          prepareDataMessageToChangeQuality(1)
        );
      });
    });

    describe('when videoQualityChangedCallback is called and videoQuality of peer is NOT VideoQuality.Q_AUTO', () => {
      it('should call peerConnection.peer.send with proper message', () => {
        peerConnection.videoQuality = VideoQuality.Q_25_PERCENT;
        peerConnection.videoQualityChangedCallback();

        expect(peerConnection.peer?.send).toBeCalledWith(
          prepareDataMessageToChangeQuality(
            VIDEO_QUALITY_TO_DECIMAL[peerConnection.videoQuality]
          )
        );
      });
    });

    describe('when initApp is called when socket is not defined', () => {
      it('should throw an appropriate error', () => {
        peerConnection.socket = undefined;
        try {
          peerConnection.initApp(NullUser, '');
          fail('it should have thrown an error here');
        } catch (e) {
          expect(e).toEqual(new PeerConnectionSocketNotDefined());
        }
      });
    });

    describe('when initApp is called properly', () => {
      it('should call emit on socket with USER_ENTER', () => {
        peerConnection.initApp(NullUser, '');

        expect(peerConnection.socket.emit).toBeCalledWith(
          'USER_ENTER',
          expect.anything()
        );
      });
    });

    describe('when sendEncryptedMessage is called when socket is NOT defined', () => {
      it('should throw an appropriate error', () => {
        peerConnection.socket = undefined;
        try {
          peerConnection.sendEncryptedMessage(
            SEND_ENCRYPTED_MESSAGE_DUMMY_PAYLOAD
          );
          fail('it should have thrown an error here');
        } catch (e) {
          expect(e).toEqual(new PeerConnectionSocketNotDefined());
        }
      });
    });

    describe('when sendEncryptedMessage is called when user is NOT defined', () => {
      it('should throw an appropriate  error', () => {
        try {
          peerConnection.sendEncryptedMessage(
            SEND_ENCRYPTED_MESSAGE_DUMMY_PAYLOAD
          );
          fail('it should have thrown an error here');
        } catch (e) {
          expect(e).toEqual(new PeerConnectionUserIsNotDefinedError());
        }
      });
    });

    describe('when sendEncryptedMessage is called when partner is NOT defined', () => {
      it('should throw an appropriate  error', () => {
        peerConnection.user = {
          username: 'af',
          privateKey: 'af',
          publicKey: 'af',
        };
        try {
          peerConnection.sendEncryptedMessage(
            SEND_ENCRYPTED_MESSAGE_DUMMY_PAYLOAD
          );
          fail('it should have thrown an error here');
        } catch (e) {
          expect(e).toEqual(new PeerConnectionPartnerIsNotDefinedError());
        }
      });
    });

    describe('when receiveEncryptedMessage is called', () => {
      it('should call peerConnectionReceiveEncryptedMessage callback', () => {
        peerConnection.receiveEncryptedMessage(
          RECEIVE_ENCRYPTED_MESSAGE_DUMMY_PAYLOAD
        );

        expect(peerConnectionReceiveEncryptedMessage).toBeCalled();
      });
    });

    describe('when createUserAndInitSocket is called and when socket is NOT defined', () => {
      it('should throw an appropriate error', () => {
        peerConnection.socket = undefined;
        try {
          peerConnection.createUserAndInitSocket();
          fail('it should have thrown an error here');
        } catch (e) {
          expect(e).toEqual(new PeerConnectionSocketNotDefined());
        }
      });
    });
  });
});
