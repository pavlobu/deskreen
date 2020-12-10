import handleDisplayingLoadingSharingIconLoop from './handleDisplayingLoadingSharingIconLoop';

jest.useFakeTimers();

describe('handleDisplayingLoadingSharingIconLoop callback', () => {
  let testParams: handleDisplayingLoadingSharingIconLoopParams;

  beforeEach(() => {
    testParams = {
      promptStep: 3,
      url: undefined,
      setIsShownLoadingSharingIcon: jest.fn(),
      setLoadingSharingIconType: jest.fn(),
      loadingSharingIconType: 'desktop',
      isShownLoadingSharingIcon: false,
    } as handleDisplayingLoadingSharingIconLoopParams
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when it was called with promptStep 3 and url undefined', () => {
    it('it should start loop, the ui should change with interval, showing and hiding icons', () => {
      const callback = handleDisplayingLoadingSharingIconLoop(testParams);
      callback();

      // imitation of infinite loop
      jest.advanceTimersByTime(2000);

      expect(testParams.setIsShownLoadingSharingIcon).toBeCalledWith(true);
      jest.clearAllMocks();

      jest.advanceTimersByTime(2000);

      expect(testParams.setIsShownLoadingSharingIcon).toBeCalledWith(false);
      expect(testParams.setLoadingSharingIconType).toBeCalledWith('application');
      jest.clearAllMocks();

      jest.advanceTimersByTime(2000);

      expect(testParams.setIsShownLoadingSharingIcon).toBeCalledWith(true);
      expect(testParams.setLoadingSharingIconType).toBeCalledWith('desktop');
      jest.clearAllMocks();

      // ... by this time we are sure, this function works!
    });
  });
});
