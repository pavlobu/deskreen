import path from 'path';
import { DesktopCapturerSource } from 'electron';
import DesktopCapturerSources, { getSourceTypeFromSourceID } from '.';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Logger from '../../utils/LoggerWithFilePrefix';
import DesktopCapturerSourceType from './DesktopCapturerSourceType';

jest.useFakeTimers();
jest.mock('../../utils/LoggerWithFilePrefix'); // Logger is now a mock constructor
jest.mock('.', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
  getSourceTypeFromSourceID: jest.requireActual('.').getSourceTypeFromSourceID,
}));
const testScreenSource1Name = 'screen:1234';
const testScreenSource2Name = 'screen:4321';
const testWindowSource1Name = 'window:1234';
const testWindowSource2Name = 'window:4321';
const testScreenSource1 = {
  type: DesktopCapturerSourceType.SCREEN,
  source: ({
    id: 'screen:adfe2',
    display_id: '82392',
  } as unknown) as DesktopCapturerSource,
};
const testScreenSource2 = {
  type: DesktopCapturerSourceType.SCREEN,
  source: ({
    id: 'screen:adfe212',
    display_id: '123234',
  } as unknown) as DesktopCapturerSource,
};
const testWindowSource1 = {
  type: DesktopCapturerSourceType.WINDOW,
  source: ({
    id: 'window:a42323',
    display_id: '82392',
  } as unknown) as DesktopCapturerSource,
};
const testWindowSource2 = {
  type: DesktopCapturerSourceType.WINDOW,
  source: ({
    id: 'window:adfe83292',
    display_id: '123234',
  } as unknown) as DesktopCapturerSource,
};
jest.mock('electron', () => {
  // eslint-disable-next-line global-require
  const testScreenSource1a = ({
    id: 'screen:adfe2',
    display_id: '82392',
  } as unknown) as DesktopCapturerSource;
  const testScreenSource2a = ({
    id: 'screen:adfe212',
    display_id: '123234',
  } as unknown) as DesktopCapturerSource;
  const testWindowSource1a = ({
    id: 'window:a42323',
    display_id: '82392',
  } as unknown) as DesktopCapturerSource;
  const testWindowSource2a = ({
    id: 'window:adfe83292',
    display_id: '123234',
  } as unknown) as DesktopCapturerSource;
  return {
    // __esModule: true,
    desktopCapturer: {
      getSources: () => {
        return new Promise((resolve) => {
          resolve([
            testScreenSource1a,
            testWindowSource1a,
            testScreenSource2a,
            testWindowSource2a,
          ]);
        });
      },
    },
  };
});

describe('DesktopCapturerSourcesService tests', () => {
  let desktopCapturerService: DesktopCapturerSources;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    // @ts-ignore
    Logger.mockClear();
    // @ts-ignore
    DesktopCapturerSources.mockClear();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when DesktopCapturerSourcesService was created properly', () => {
    it('should create logger properly', () => {
      const DesktopCapturerSourcesClass = jest.requireActual('.')
        .default as DesktopCapturerSources;

      // @ts-ignore
      desktopCapturerService = new DesktopCapturerSourcesClass();

      expect(Logger).toHaveBeenCalledTimes(1);
      expect(Logger).toHaveBeenCalledWith(path.join(__dirname, 'index.ts'));
    });

    it('should call startRefreshDesktopCapturerSourcesLoop', () => {
      const DesktopCapturerSourcesClass = jest.requireActual('.')
        .default as DesktopCapturerSources;
      // @ts-ignore
      desktopCapturerService = new DesktopCapturerSourcesClass();
      desktopCapturerService.startRefreshDesktopCapturerSourcesLoop = jest.fn();

      desktopCapturerService.constructor();

      expect(
        desktopCapturerService.startRefreshDesktopCapturerSourcesLoop
      ).toHaveBeenCalledTimes(1);
    });

    it('should call refreshDesktopCapturerSources multiple times', () => {
      const DesktopCapturerSourcesClass = jest.requireActual('.')
        .default as DesktopCapturerSources;

      // @ts-ignore
      desktopCapturerService = new DesktopCapturerSourcesClass();

      desktopCapturerService.refreshDesktopCapturerSources = jest.fn();

      for (let i = 1; i < 5; i += 1) {
        jest.advanceTimersByTime(6000);

        expect(
          desktopCapturerService.refreshDesktopCapturerSources
        ).toHaveBeenCalledTimes(i);
      }
    });

    it('should call startPollForInactiveListenersLoop', () => {
      const DesktopCapturerSourcesClass = jest.requireActual('.')
        .default as DesktopCapturerSources;
      // @ts-ignore
      desktopCapturerService = new DesktopCapturerSourcesClass();
      desktopCapturerService.startPollForInactiveListenersLoop = jest.fn();

      desktopCapturerService.constructor();

      expect(
        desktopCapturerService.startPollForInactiveListenersLoop
      ).toHaveBeenCalledTimes(1);
    });

    describe('when .getSourcesMap was called', () => {
      it('should return a sources map object', () => {
        const DesktopCapturerSourcesClass = jest.requireActual('.')
          .default as DesktopCapturerSources;
        // @ts-ignore
        desktopCapturerService = new DesktopCapturerSourcesClass();

        const res = desktopCapturerService.getSourcesMap();

        expect(desktopCapturerService.sources).toBe(res);
      });
    });

    describe('when .getScreenSources was called', () => {
      it('should return sources array which are of type SCREEN only', () => {
        const DesktopCapturerSourcesClass = jest.requireActual('.')
          .default as DesktopCapturerSources;
        // @ts-ignore
        desktopCapturerService = new DesktopCapturerSourcesClass();
        desktopCapturerService.sources.set(
          testScreenSource1Name,
          testScreenSource1
        );
        desktopCapturerService.sources.set(
          testScreenSource2Name,
          testScreenSource2
        );
        desktopCapturerService.sources.set(
          testWindowSource1Name,
          testWindowSource1
        );
        desktopCapturerService.sources.set(
          testWindowSource2Name,
          testWindowSource2
        );

        const res = desktopCapturerService.getScreenSources();

        expect(res).toEqual([
          testScreenSource1.source,
          testScreenSource2.source,
        ]);
      });
    });

    describe('when .getAppWindowSources was called', () => {
      it('should return sources array which are of type WINDOW only', () => {
        const DesktopCapturerSourcesClass = jest.requireActual('.')
          .default as DesktopCapturerSources;
        // @ts-ignore
        desktopCapturerService = new DesktopCapturerSourcesClass();
        desktopCapturerService.sources.set(
          testScreenSource1Name,
          testScreenSource1
        );
        desktopCapturerService.sources.set(
          testScreenSource2Name,
          testScreenSource2
        );
        desktopCapturerService.sources.set(
          testWindowSource1Name,
          testWindowSource1
        );
        desktopCapturerService.sources.set(
          testWindowSource2Name,
          testWindowSource2
        );

        const res = desktopCapturerService.getAppWindowSources();

        expect(res).toEqual([
          testWindowSource1.source,
          testWindowSource2.source,
        ]);
      });
    });

    describe('when .getSourceDisplayIDBySourceID was called', () => {
      it('should return proper source display_id string', () => {
        const DesktopCapturerSourcesClass = jest.requireActual('.')
          .default as DesktopCapturerSources;
        // @ts-ignore
        desktopCapturerService = new DesktopCapturerSourcesClass();
        desktopCapturerService.sources.set(
          testScreenSource1Name,
          testScreenSource1
        );
        desktopCapturerService.sources.set(
          testScreenSource2Name,
          testScreenSource2
        );
        desktopCapturerService.sources.set(
          testWindowSource1Name,
          testWindowSource1
        );
        desktopCapturerService.sources.set(
          testWindowSource2Name,
          testWindowSource2
        );

        const res = desktopCapturerService.getSourceDisplayIDByDisplayCapturerSourceID(
          testScreenSource1.source.id
        );

        expect(res).toEqual(testScreenSource1.source.display_id);
      });
    });

    describe('when .getDesktopCapturerSources was called', () => {
      it('should resolve with proper map of screen sources', async () => {
        const DesktopCapturerSourcesClass = jest.requireActual('.')
          .default as DesktopCapturerSources;
        // @ts-ignore
        desktopCapturerService = new DesktopCapturerSourcesClass();
        const testSourcesMap = new Map<string, DesktopCapturerSourceWithType>();
        testSourcesMap.set(testScreenSource1.source.id, testScreenSource1);
        testSourcesMap.set(testScreenSource2.source.id, testScreenSource2);
        testSourcesMap.set(testWindowSource1.source.id, testWindowSource1);
        testSourcesMap.set(testWindowSource2.source.id, testWindowSource2);

        const res = await desktopCapturerService.getDesktopCapturerSources();

        expect(res).toEqual(testSourcesMap);
      });
    });

    describe('when .refreshDesktopCapturerSources was called', () => {
      it('should call proper methods to check whether windows are closed and screens disconnected', async () => {
        const DesktopCapturerSourcesClass = jest.requireActual('.')
          .default as DesktopCapturerSources;
        // @ts-ignore
        desktopCapturerService = new DesktopCapturerSourcesClass();
        desktopCapturerService.checkForClosedWindows = jest.fn();
        desktopCapturerService.checkForScreensDisconnected = jest.fn();
        desktopCapturerService.constructor();

        await desktopCapturerService.refreshDesktopCapturerSources();

        expect(desktopCapturerService.checkForClosedWindows).toBeCalled();
        expect(desktopCapturerService.checkForScreensDisconnected).toBeCalled();
      });
    });
  });
});

describe('getSourceTypeFromSourceID tests', () => {
  it('should return proper source type depending on input type', () => {
    const testWindowSource = 'window:1234';
    const testScreenSource = 'screen:4321';

    expect(getSourceTypeFromSourceID(testWindowSource)).toBe(
      DesktopCapturerSourceType.WINDOW
    );
    expect(getSourceTypeFromSourceID(testScreenSource)).toBe(
      DesktopCapturerSourceType.SCREEN
    );
  });
});
