/* eslint-disable @typescript-eslint/ban-ts-comment */
import getDesktopSourceStreamBySourceID from './getDesktopSourceStreamBySourceID';

jest.useFakeTimers();

const TEST_SCREEN_SHARING_SOURCE_ID = 'screen:1234ad';

describe('getDesktopSourceStreamBySourceID callback', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-global-assign
    // @ts-ignore
    global.navigator.mediaDevices = { getUserMedia: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when getDesktopSourceStreamBySourceID called with default parameters', () => {
    it('should handle getUserMedia without width and height (APPLICATION WINDOW SHARING CASE)', () => {
      getDesktopSourceStreamBySourceID(TEST_SCREEN_SHARING_SOURCE_ID);

      expect(navigator.mediaDevices.getUserMedia).toBeCalledWith({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: TEST_SCREEN_SHARING_SOURCE_ID,
            minFrameRate: 15,
            maxFrameRate: 60,
          },
        },
      });
    });
  });

  describe('when getDesktopSourceStreamBySourceID called with width and height parameters (SCREEN SHARING CASE)', () => {
    it('should handle getUserMedia with width and height', () => {
      const TEST_WIDTH = 640;
      const TEST_HEIGHT = 480;
      getDesktopSourceStreamBySourceID(TEST_SCREEN_SHARING_SOURCE_ID, 640, 480);

      expect(navigator.mediaDevices.getUserMedia).toBeCalledWith({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: TEST_SCREEN_SHARING_SOURCE_ID,

            minWidth: TEST_WIDTH,
            maxWidth: TEST_WIDTH,
            minHeight: TEST_HEIGHT,
            maxHeight: TEST_HEIGHT,

            minFrameRate: 15,
            maxFrameRate: 60,
          },
        },
      });
    });
  });
});
