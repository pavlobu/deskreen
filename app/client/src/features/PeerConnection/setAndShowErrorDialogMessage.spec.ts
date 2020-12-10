import SimplePeer from 'simple-peer';
import PeerConnection from '.';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import PeerConnectionUIHandler from './PeerConnectionUIHandler';
import setAndShowErrorDialogMessage from './setAndShowErrorDialogMessage';

jest.useFakeTimers();

jest.mock('../../utils/crypto.ts');
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
    };
  });
});

describe('peerConnectionHandlePeer callback', () => {
  let peerConnection: PeerConnection;

  const setIsErrorDialogOpen = jest.fn();

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
        setIsErrorDialogOpen
      )
    );
    peerConnection.peer = new SimplePeer();
    peerConnection.UIHandler.errorDialogMessage = ErrorMessage.UNKNOWN_ERROR;

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when setAndShowErrorDialogMessage is called properly', () => {
    describe('when error message in ui handler is UNKNOWN_ERROR', () => {
      it('whould show error dialog with given error message', () => {
        expect(peerConnection.UIHandler.errorDialogMessage).toEqual(
          ErrorMessage.UNKNOWN_ERROR
        );

        const errorMessage = ErrorMessage.DENY_TO_CONNECT;
        setAndShowErrorDialogMessage(peerConnection, errorMessage);

        expect(
          peerConnection.UIHandler.setDialogErrorMessageCallback
        ).toBeCalledWith(errorMessage);
        expect(peerConnection.UIHandler.setIsErrorDialogOpen).toBeCalledWith(
          true
        );
        expect(peerConnection.UIHandler.errorDialogMessage).toEqual(
          errorMessage
        );
      });
    });

    describe('when error message in ui handler is NOT UNKNOWN_ERROR', () => {
      it('whould not show anything in UI and do nothing to UIHandler', () => {
        const originalErrorMessage = ErrorMessage.DISCONNECTED;
        peerConnection.UIHandler.errorDialogMessage = originalErrorMessage;

        const errorMessage = ErrorMessage.UNKNOWN_ERROR;

        setAndShowErrorDialogMessage(peerConnection, errorMessage);

        expect(
          peerConnection.UIHandler.setDialogErrorMessageCallback
        ).not.toBeCalled();
        expect(peerConnection.UIHandler.setIsErrorDialogOpen).not.toBeCalled();
        expect(peerConnection.UIHandler.errorDialogMessage).toEqual(
          originalErrorMessage
        );
      });
    });
  });
});
