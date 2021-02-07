import SimplePeer from 'simple-peer';
import PeerConnection from '.';
import Crypto from '../../utils/crypto';
import VideoAutoQualityOptimizer from '../VideoAutoQualityOptimizer';
import { VideoQuality } from '../VideoAutoQualityOptimizer/VideoQualityEnum';
import peerConnectionHandlePeer, {
  getSharingShourceType,
} from './peerConnectionHandlePeer';
import PeerConnectionPeerIsNullError from './errors/PeerConnectionPeerIsNullError';
import PeerConnectionUIHandler from './PeerConnectionUIHandler';
import {
  prepareDataMessageToChangeQuality,
  prepareDataMessageToGetSharingSourceType,
} from './simplePeerDataMessages';
import ScreenSharingSource from './ScreenSharingSourceEnum';

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

const screen_sharing_source_type_JSON_DATA =
  ' \
  { \
    "type": "screen_sharing_source_type", \
    "payload": { \
      "value": "screen" \
    } \
  } \
';

const window_sharing_source_type_JSON_DATA =
  ' \
  { \
    "type": "screen_sharing_source_type", \
    "payload": { \
      "value": "window" \
    } \
  } \
';

describe('peerConnectionHandlePeer callback', () => {
  let peerConnection: PeerConnection;
  let videoQualityOptimizer: VideoAutoQualityOptimizer;

  const setURLCallbackMock = jest.fn();

  beforeEach(() => {
    videoQualityOptimizer = new VideoAutoQualityOptimizer();
    jest.spyOn(videoQualityOptimizer, 'startOptimizationLoop');
    jest.spyOn(videoQualityOptimizer, 'goodQualityCallback');
    jest.spyOn(videoQualityOptimizer, 'halfQualityCallbak');
    peerConnection = new PeerConnection(
      '123',
      setURLCallbackMock,
      new Crypto(),
      videoQualityOptimizer,
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
    jest.spyOn(peerConnection, 'sendEncryptedMessage');
    peerConnection.peer = new SimplePeer();

    peerConnection.user = {
      username: 'af',
      privateKey: 'af',
      publicKey: 'af',
    };
    peerConnection.partner = {
      username: 'af',
      publicKey: 'af',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when peerConnection with peer null passed as parameter', () => {
    function callPeerConnectionHandlePeerWithPeerNull() {
      peerConnection.peer = null;

      peerConnectionHandlePeer(peerConnection);
    }
    it('should throw an error', () => {
      peerConnection.peer = null;

      expect(callPeerConnectionHandlePeerWithPeerNull).toThrow(
        new PeerConnectionPeerIsNullError()
      );
    });
  });

  describe('when peerConnectionHandlePeer() is called properly', () => {
    it('should have set .on("stream", () => {}) callback on PeerConnection.peer', () => {
      jest.requireMock('simple-peer');

      peerConnectionHandlePeer(peerConnection);

      expect(peerConnection.peer?.on).toBeCalledWith(
        'stream',
        expect.anything()
      );
    });

    it('should have set .on("data", () => {}) callback on PeerConnection.peer', () => {
      jest.requireMock('simple-peer');

      peerConnectionHandlePeer(peerConnection);

      expect(peerConnection.peer?.on).toBeCalledWith('data', expect.anything());
    });

    it('should have set .on("signal", () => {}) callback on PeerConnection.peer', () => {
      jest.requireMock('simple-peer');

      peerConnectionHandlePeer(peerConnection);

      expect(peerConnection.peer?.on).toBeCalledWith(
        'signal',
        expect.anything()
      );
    });

    describe('when "stream" event occured', () => {
      it('should start video quality optimization loop', () => {
        peerConnectionHandlePeer(peerConnection);

        peerConnection.peer?.emit('stream');

        expect(
          peerConnection.videoAutoQualityOptimizer.startOptimizationLoop
        ).toBeCalled();
      });

      it('should call getSharingShourceType function to get sharing source type from host', () => {
        peerConnectionHandlePeer(peerConnection);

        peerConnection.peer?.emit('stream');

        expect(setTimeout).toHaveBeenLastCalledWith(
          getSharingShourceType,
          1000,
          peerConnection
        );
      });

      describe('when quality is AUTO and when video quality optimizer requests GOOD quality', () => {
        it('should call .send with proper data message', () => {
          peerConnection.videoQuality = VideoQuality.Q_AUTO;
          peerConnectionHandlePeer(peerConnection);

          peerConnection.peer?.emit('stream');

          jest.advanceTimersByTime(2000);
          peerConnection.videoAutoQualityOptimizer.goodQualityCallback();

          expect(peerConnection.peer?.send).toBeCalledWith(
            prepareDataMessageToChangeQuality(1)
          );
        });
      });

      describe('when quality is NOT AUTO and when video quality optimizer requests GOOD quality', () => {
        it('should call NOT .send with proper data message', () => {
          peerConnection.videoQuality = VideoQuality.Q_25_PERCENT;
          peerConnectionHandlePeer(peerConnection);
          peerConnection.peer?.emit('stream');

          peerConnection.videoAutoQualityOptimizer.goodQualityCallback();

          expect(peerConnection.peer?.send).not.toBeCalled();
        });
      });

      describe('when quality is AUTO and when video quality optimizer requests HALF quality', () => {
        it('should call .send with proper data message', () => {
          peerConnection.videoQuality = VideoQuality.Q_AUTO;
          peerConnectionHandlePeer(peerConnection);

          peerConnection.peer?.emit('stream');

          jest.advanceTimersByTime(2000);
          peerConnection.videoAutoQualityOptimizer.halfQualityCallbak();

          expect(peerConnection.peer?.send).toBeCalledWith(
            prepareDataMessageToChangeQuality(0.5)
          );
        });
      });
    });

    describe('when quality is NOT AUTO and when video quality optimizer requests GOOD quality', () => {
      it('should call NOT .send with proper data message', () => {
        peerConnection.videoQuality = VideoQuality.Q_25_PERCENT;
        peerConnectionHandlePeer(peerConnection);
        peerConnection.peer?.emit('stream');

        peerConnection.videoAutoQualityOptimizer.halfQualityCallbak();

        expect(peerConnection.peer?.send).not.toBeCalled();
      });
    });

    describe('when "signal" event occured', () => {
      it('should call sendEncryptedMessage on peer connection', () => {
        peerConnectionHandlePeer(peerConnection);
        peerConnection.peer?.emit('signal');

        expect(peerConnection.sendEncryptedMessage).toBeCalled();
      });
    });

    describe('when "data" event occured', () => {
      describe('when data.type is "screen_sharing_source_type"', () => {
        describe('when dataJSON.payload.value === screen', () => {
          it('should call UIHandler.setScreenSharingSourceTypeCallback with "screen" string as parameter', () => {
            peerConnectionHandlePeer(peerConnection);

            peerConnection.peer?.emit(
              'data',
              screen_sharing_source_type_JSON_DATA
            );

            expect(
              peerConnection.UIHandler.setScreenSharingSourceTypeCallback
            ).toBeCalledWith(ScreenSharingSource.SCREEN);
          });
        });

        describe('when dataJSON.payload.value === window', () => {
          it('should call UIHandler.setScreenSharingSourceTypeCallback with "window" string as parameter', () => {
            peerConnectionHandlePeer(peerConnection);

            peerConnection.peer?.emit(
              'data',
              window_sharing_source_type_JSON_DATA
            );

            expect(
              peerConnection.UIHandler.setScreenSharingSourceTypeCallback
            ).toBeCalledWith(ScreenSharingSource.WINDOW);
          });
        });

        describe('when dataJSON.payload.value is NOT "screen" or "window"', () => {
          it('should do nothing', () => {
            expect(
              peerConnection.UIHandler.setScreenSharingSourceTypeCallback
            ).not.toBeCalled();
          });
        });
      });

      describe('when data.type is NOT "screen_sharing_source_type"', () => {
        it('should do nothing', () => {
          expect(
            peerConnection.UIHandler.setScreenSharingSourceTypeCallback
          ).not.toBeCalled();
        });
      });
    });
  });

  describe('when getSharingSourceType is called properly', () => {
    it('should call .send method with proper payload to get sharing source type from host', () => {
      getSharingShourceType(peerConnection);

      expect(peerConnection.peer?.send).toBeCalledWith(
        prepareDataMessageToGetSharingSourceType()
      );
    });
  });
});
