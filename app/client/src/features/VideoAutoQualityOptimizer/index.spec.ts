import VideoAutoQualityOptimizer from '.';
import {
  COMPARISON_CANVAS_ID,
  REACT_PLAYER_WRAPPER_ID,
} from '../../constants/appConstants';
import CanvasNotDefinedError from './errors/CanvasNotDefinedError';
import ImageDataIsUndefinedError from './errors/ImageDataIsUndefinedError';
import VideoDimensionsAreWrongError from './errors/VideoDimensionsAreWrongError';
import VideoNotDefinedError from './errors/VideoNotDefinedError';

jest.useFakeTimers();

const TEST_IMAGE_DATA = {
  data: new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
  height: 1,
  width: 10,
} as ImageData;

const PREV_FRAME_IMAGE_DATA = {
  data: new Uint8ClampedArray([2, 2, 3, 4, 5, 6, 7, 8, 9, 0]),
  height: 1,
  width: 10,
} as ImageData;

const LOW_MISMATCH = 0.09;
const HIGH_MISMATCH = 0.2;

describe('VideoAutoQualityOptimizer', () => {
  let optimizer: VideoAutoQualityOptimizer;

  beforeEach(() => {
    optimizer = new VideoAutoQualityOptimizer();

    optimizer.video = {
      ...optimizer.video,
      videoWidth: 1142,
      videoHeight: 1142,
    } as HTMLVideoElement;
    // @ts-ignore
    optimizer.canvas = {
      width: 123,
      height: 123,
      getContext: () => {
        return {
          clearRect: () => {},
          drawImage: () => {},
        };
      },
    } as HTMLCanvasElement;
  });

  describe('when VideoAutoQualityOptimizer is created properly', () => {
    describe('whev optimization loop is running', () => {
      it('should call goodQualityCallback when there is small frames mismatch and halfQualityCallback when there is large frames mismatch', () => {
        optimizer.prepareCanvasAndVideo = () => {};
        optimizer.validateBeforeCalculations = () => {};
        optimizer.clearCanvas = () => {};
        optimizer.scaleCanvas = () => {};
        optimizer.drawVideoFrameToCanvas = () => {};
        optimizer.getImageDataFromCanvas = () => ({} as ImageData);
        optimizer.prevFrame = PREV_FRAME_IMAGE_DATA;

        optimizer.halfQualityCallbak = jest.fn();
        optimizer.goodQualityCallback = jest.fn();

        // 1. STEP 1 simulate high percent of frames mismatch
        optimizer.getPreviousAndCurrentFrameMismatchInPercent = () => 0.5
        optimizer.largeMismatchFramesCount = 5;
        optimizer.startOptimizationLoop();
        jest.advanceTimersByTime(5000);

        expect(optimizer.halfQualityCallbak).toBeCalled();

        // 2. STEP 2 simulate low percent of frames mismatch
        optimizer.getPreviousAndCurrentFrameMismatchInPercent = () => 0.03
        optimizer.largeMismatchFramesCount = 0;
        optimizer.startOptimizationLoop();
        jest.advanceTimersByTime(5000);

        expect(optimizer.goodQualityCallback).toBeCalled();

        // 3. repeat step 1
        optimizer.getPreviousAndCurrentFrameMismatchInPercent = () => 0.5
        optimizer.largeMismatchFramesCount = 5;
        optimizer.startOptimizationLoop();
        jest.advanceTimersByTime(5000);

        expect(optimizer.halfQualityCallbak).toBeCalled();

        // 4. repeat step 2
        optimizer.getPreviousAndCurrentFrameMismatchInPercent = () => 0.03
        optimizer.largeMismatchFramesCount = 0;
        optimizer.startOptimizationLoop();
        jest.advanceTimersByTime(5000);

        expect(optimizer.goodQualityCallback).toBeCalled();

      });
    });

    describe('when validateVideoIsDefined is called', () => {
      describe('when video local variable is undefined', () => {
        it('should throw an error', () => {
          optimizer.video = undefined;

          try {
            optimizer.validateVideoIsDefined();
          } catch (e) {
            expect(e).toEqual(new VideoNotDefinedError());
          }
        });
      });
    });

    describe('when validateVideoIsDefined is called', () => {
      describe('when canvas local variable is undefined', () => {
        it('should throw an error', () => {
          optimizer.canvas = undefined;

          try {
            optimizer.validateCanvasIsDefined();
          } catch (e) {
            expect(e).toEqual(new CanvasNotDefinedError());
          }
        });
      });
    });

    describe('when startOptimizationLoop of VideoAutoQualityOptimizer is called', () => {
      it('should define canvas and video internal variables', () => {
        const originalDocumentQuerySelector = document.querySelector;
        const valueForVideo = 'a';
        const valueForCanvas = 'b';

        try {
          document.querySelector = (s: string) => {
            if (s === `#${REACT_PLAYER_WRAPPER_ID} > video`) {
              return valueForVideo;
            }
            if (s === `#${COMPARISON_CANVAS_ID}`) {
              return valueForCanvas;
            }
            return '';
          };

          optimizer.startOptimizationLoop();
          jest.advanceTimersByTime(2000);
        } catch (e) {
          expect(optimizer.video).toBe(valueForVideo);
          expect(optimizer.canvas).toBe(valueForCanvas);
        }

        document.querySelector = originalDocumentQuerySelector;
      });
    });

    describe('when doFrameComparisonAndQualityOptimization of VideoAutoQualityOptimizer is called', () => {
      describe('when width of video is 0', () => {
        it('should throw an error', () => {
          optimizer.video = {
            ...optimizer.video,
            videoWidth: 0,
            videoHeight: 1142,
          } as HTMLVideoElement;
          try {
            optimizer.doFrameComparisonAndQualityOptimization();
            fail('should have thrown error here!');
          } catch (e) {
            expect(e).toEqual(new VideoDimensionsAreWrongError());
          }
        });
      });

      describe('when height of video is 0', () => {
        it('should throw an error', () => {
          optimizer.video = {
            ...optimizer.video,
            videoWidth: 1142,
            videoHeight: 0,
          } as HTMLVideoElement;
          try {
            optimizer.doFrameComparisonAndQualityOptimization();
            fail('should have thrown error here!');
          } catch (e) {
            expect(e).toEqual(new VideoDimensionsAreWrongError());
          }
        });

        it('should call scaleCanvas()', () => {
          const spy = jest.spyOn(optimizer, 'scaleCanvas');

          try {
            optimizer.doFrameComparisonAndQualityOptimization();
          } catch (e) {}

          expect(spy).toBeCalled();
        });
      });

      it('should call drawVideoFrameToCanvas()', () => {
        const spy = jest.spyOn(optimizer, 'drawVideoFrameToCanvas');

        try {
          optimizer.doFrameComparisonAndQualityOptimization();
        } catch (e) {}

        expect(spy).toBeCalled();
      });

      describe('when getImageDataFromCanvas returns undefined', () => {
        it('should throw an error', () => {
          jest
            .spyOn(optimizer, 'getImageDataFromCanvas')
            .mockImplementation(() => undefined);

          try {
            optimizer.doFrameComparisonAndQualityOptimization();
            fail('it should have thrown an error here');
          } catch (e) {
            expect(e).toEqual(new ImageDataIsUndefinedError());
          }
        });
      });

      describe('when prevFrame is undefined', () => {
        it('should set prevFrame to be the same as test image data', () => {
          jest
            .spyOn(optimizer, 'getImageDataFromCanvas')
            .mockImplementation(() => TEST_IMAGE_DATA);

          try {
            optimizer.doFrameComparisonAndQualityOptimization();
          } catch (e) {}

          expect(optimizer.prevFrame).toEqual(TEST_IMAGE_DATA);
        });
      });

      describe('when getPreviousAndCurrentFrameMismatchInPercent returns a number', () => {
        it('should call handleFramesMismatch()', () => {
          const TEST_MISMATCH = 0.1;
          optimizer.prevFrame = TEST_IMAGE_DATA;
          jest
            .spyOn(optimizer, 'getImageDataFromCanvas')
            .mockImplementation(() => TEST_IMAGE_DATA);
          jest
            .spyOn(optimizer, 'getPreviousAndCurrentFrameMismatchInPercent')
            .mockImplementation(() => 0.1);
          const spyOfHandleFramesMismatch = jest.spyOn(
            optimizer,
            'handleFramesMismatch'
          );

          optimizer.doFrameComparisonAndQualityOptimization();

          expect(spyOfHandleFramesMismatch).toBeCalledWith(TEST_MISMATCH);
        });
      });

      describe('when doFrameComparisonAndQualityOptimization run was successful', () => {
        it('should set prevFrame to test image data', () => {
          optimizer.prevFrame = PREV_FRAME_IMAGE_DATA;
          jest
            .spyOn(optimizer, 'getImageDataFromCanvas')
            .mockImplementation(() => TEST_IMAGE_DATA);
          jest
            .spyOn(optimizer, 'getPreviousAndCurrentFrameMismatchInPercent')
            .mockImplementation(() => 0.1);

          optimizer.doFrameComparisonAndQualityOptimization();

          expect(optimizer.prevFrame).toEqual(TEST_IMAGE_DATA);
        });
      });

      describe('when getPreviousAndCurrentFrameMismatchInPercent run was successful', () => {});
    });

    describe('when getPreviousAndCurrentFrameMismatchInPercent was called', () => {
      describe('when canvas is undefined', () => {
        it('should return 0', () => {
          optimizer.canvas = undefined;

          const res = optimizer.getPreviousAndCurrentFrameMismatchInPercent(
            TEST_IMAGE_DATA
          );

          expect(res).toBe(0);
        });
      });

      describe('when getPreviousAndCurrentFrameMismatchInPercent ran properly', () => {
        it('should return proper mismatch in percent', () => {
          const MISMATCH_TO_RETURN = 44;
          jest
            .spyOn(optimizer, 'getNumberOfMismatchedPixels')
            .mockImplementation(() => MISMATCH_TO_RETURN);
          // @ts-ignore
          optimizer.canvas = {
            width: 123,
            height: 123,
          };
          const width = optimizer.canvas?.width as number;
          const height = optimizer.canvas?.height as number;
          const expected = MISMATCH_TO_RETURN / (width * height);

          const res = optimizer.getPreviousAndCurrentFrameMismatchInPercent(
            TEST_IMAGE_DATA
          );

          expect(res).toBe(expected);
        });
      });
    });

    describe('when handleFramesMismatch was called', () => {
      describe('when it received low percent mismatch and largeMismatchFramesCount is more than zero', () => {
        it('should decrease largeMismatchFramesCount by one', () => {
          const MISMATCH_FRAMES_COUNT = 2;
          optimizer.largeMismatchFramesCount = MISMATCH_FRAMES_COUNT;
          optimizer.handleFramesMismatch(LOW_MISMATCH);
          const expected = MISMATCH_FRAMES_COUNT - 1;

          expect(optimizer.largeMismatchFramesCount).toBe(expected);
        });
      });

      describe('when it received LOW percent mismatch and isRequestedHalfQuality is true', () => {
        it('should call goodQualityCallback and set isRequestedHalfQuality to false', () => {
          const MISMATCH_FRAMES_COUNT = 0;
          optimizer.largeMismatchFramesCount = MISMATCH_FRAMES_COUNT;
          optimizer.isRequestedHalfQuality = true;
          optimizer.goodQualityCallback = jest.fn();
          optimizer.handleFramesMismatch(LOW_MISMATCH);

          expect(optimizer.goodQualityCallback).toBeCalled();
          expect(optimizer.isRequestedHalfQuality).toBe(false);
        });
      });

      describe('when it received LOW percent mismatch and isRequestedHalfQuality is false', () => {
        it('should call NOT goodQualityCallback', () => {
          const MISMATCH_FRAMES_COUNT = 0;
          optimizer.largeMismatchFramesCount = MISMATCH_FRAMES_COUNT;
          optimizer.isRequestedHalfQuality = false;
          optimizer.goodQualityCallback = jest.fn();
          optimizer.handleFramesMismatch(LOW_MISMATCH);

          expect(optimizer.goodQualityCallback).not.toBeCalled();
        });
      });

      describe('when it received HIGH percent mismatch', () => {
        describe('when isRequestedHalfQuality is false and there were MORE than consecutive 3 frames mismatch', () => {
          it('should call halfQualityCallbak and set isRequestedHalfQuality to true', () => {
            const MISMATCH_FRAMES_COUNT = 3;
            optimizer.largeMismatchFramesCount = MISMATCH_FRAMES_COUNT;
            optimizer.isRequestedHalfQuality = false;
            optimizer.halfQualityCallbak = jest.fn();
            optimizer.handleFramesMismatch(HIGH_MISMATCH);

            expect(optimizer.halfQualityCallbak).toBeCalled();
            expect(optimizer.isRequestedHalfQuality).toBe(true);
          });
        });

        describe('when isRequestedHalfQuality is false and there were LESS than consecutive 3 frames mismatch', () => {
          it('should increase largeMismatchFramesCount by one', () => {
            const MISMATCH_FRAMES_COUNT = 1;
            optimizer.largeMismatchFramesCount = MISMATCH_FRAMES_COUNT;
            optimizer.isRequestedHalfQuality = false;
            optimizer.handleFramesMismatch(HIGH_MISMATCH);
            const expected = MISMATCH_FRAMES_COUNT + 1;

            expect(optimizer.largeMismatchFramesCount).toBe(expected);
          });
        });
      });
    });
  });
});
