import PeerConnection from '..';
import VideoAutoQualityOptimizer from '../../VideoAutoQualityOptimizer';
import Crypto from '../../../utils/crypto';
import startSocketConnectedCheckingLoop from '.';
import setAndShowErrorDialogMessage from '../setAndShowErrorDialogMessage';
import PeerConnectionUIHandler from '../PeerConnectionUIHandler';

jest.useFakeTimers();

jest.mock('../setAndShowErrorDialogMessage');

describe('startSocketConnectedCheckingLoop', () => {
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

    peerConnection.socket = { connected: true };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('when interval passed and socket is connected', () => {
    it('should NOT call setAndShowErrorDialogMessage', () => {
      startSocketConnectedCheckingLoop(peerConnection);
      jest.advanceTimersByTime(3000);

      expect(setAndShowErrorDialogMessage).not.toBeCalled();
    });
  });

  describe('when interval passed and socket is NOT connected', () => {
    it('should call setAndShowErrorDialogMessage', () => {
      peerConnection.socket.connected = false;

      startSocketConnectedCheckingLoop(peerConnection);
      jest.advanceTimersByTime(3000);

      expect(setAndShowErrorDialogMessage).toBeCalled();
    });
  });
});
