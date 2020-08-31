import Logger from './logger';

describe('LoggerWithFilePrefix that uses electron-log', () => {
  const filePath = 'some/file/path';
  let log = new Logger(filePath);
  const mockLoggerInfoProperty = jest.fn();
  const mockLoggerErrorProperty = jest.fn();
  const mockLoggerWarnProperty = jest.fn();
  const mockLoggerVerboseProperty = jest.fn();
  const mockLoggerDebugProperty = jest.fn();
  const mockLoggerSillyProperty = jest.fn();

  beforeEach(() => {
    mockLoggerInfoProperty.mockClear();
    mockLoggerErrorProperty.mockClear();
    mockLoggerWarnProperty.mockClear();
    mockLoggerVerboseProperty.mockClear();
    mockLoggerDebugProperty.mockClear();
    mockLoggerDebugProperty.mockClear();

    log = new Logger(filePath);
    Object.defineProperty(log, 'electronLog', {
      value: {
        info: mockLoggerInfoProperty,
        error: mockLoggerErrorProperty,
        warn: mockLoggerWarnProperty,
        verbose: mockLoggerVerboseProperty,
        debug: mockLoggerDebugProperty,
        silly: mockLoggerSillyProperty,
      },
    });
  });
  it('should use internal electronLog.info() with filePath as first argument, when .info() is called', () => {
    log.info('some info() log here');

    expect(mockLoggerInfoProperty).toHaveBeenCalledWith(
      filePath,
      expect.anything(),
      expect.anything()
    );
  });

  it('should use internal electronLog.error() with filePath as first argument, when .error() is called', () => {
    log.error('some error() log here');

    expect(mockLoggerErrorProperty).toHaveBeenCalledWith(
      filePath,
      expect.anything(),
      expect.anything()
    );
  });

  it('should use internal electronLog.warn() with filePath as first argument, when .warn() is called', () => {
    log.warn('some warn() log here');

    expect(mockLoggerWarnProperty).toHaveBeenCalledWith(
      filePath,
      expect.anything(),
      expect.anything()
    );
  });

  it('should use internal electronLog.verbose() with filePath as first argument, when .verbose() is called', () => {
    log.verbose('some verbose() log here');

    expect(mockLoggerVerboseProperty).toHaveBeenCalledWith(
      filePath,
      expect.anything(),
      expect.anything()
    );
  });

  it('should use internal electronLog.debug() with filePath as first argument, when .debug() is called', () => {
    log.debug('some debug() log here');

    expect(mockLoggerDebugProperty).toHaveBeenCalledWith(
      filePath,
      expect.anything(),
      expect.anything()
    );
  });

  it('should use internal electronLog.silly() with filePath as first argument, when .silly() is called', () => {
    log.silly('some silly() log here');

    expect(mockLoggerSillyProperty).toHaveBeenCalledWith(
      filePath,
      expect.anything(),
      expect.anything()
    );
  });
});
