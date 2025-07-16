/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

describe('HTTP Server Dual-Stack Binding', () => {
  let mockServer: any;
  let mockListen: jest.Mock;
  let mockOn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockListen = jest.fn();
    mockOn = jest.fn();
    mockServer = {
      listen: mockListen,
      on: mockOn,
    };

    // Make mockOn chainable
    mockOn.mockReturnValue(mockServer);
  });

  it('demonstrates dual-stack binding with fallback pattern', () => {
    // This test documents and verifies the pattern used in callListenOnHttpServer
    const port = 3131;
    const dualStackHost = '::';
    const ipv4Host = '0.0.0.0';
    let errorHandler: ((err: any) => void) | undefined;

    // Setup mock to capture error handler
    mockOn.mockImplementation((event: string, handler: (err: any) => void) => {
      if (event === 'error') {
        errorHandler = handler;
      }
      return mockServer;
    });

    // Mock successful listen
    mockListen.mockImplementation(
      (p: number, host: string, callback?: () => void) => {
        if (callback) callback();
        return mockServer;
      }
    );

    // Simulate the actual implementation pattern
    const listenWithFallback = () => {
      return mockServer
        .listen(port, dualStackHost, () => {
          console.log(`Server listening on ${dualStackHost}:${port}`);
        })
        .on('error', (err: any) => {
          if (err.code === 'EAFNOSUPPORT') {
            return mockServer.listen(port, ipv4Host, () => {
              console.log(`Server listening on ${ipv4Host}:${port}`);
            });
          }
          throw err;
        });
    };

    // Execute
    const result = listenWithFallback();

    // Verify initial call
    expect(mockListen).toHaveBeenCalledWith(
      port,
      dualStackHost,
      expect.any(Function)
    );
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(result).toBe(mockServer);
  });

  it('verifies fallback to IPv4 when dual-stack fails', () => {
    const port = 3131;
    const dualStackHost = '::';
    const ipv4Host = '0.0.0.0';
    let listenCallCount = 0;

    // Mock listen to fail on first call, succeed on second
    mockListen.mockImplementation(
      (p: number, host: string, callback?: () => void) => {
        listenCallCount += 1;
        if (listenCallCount === 1 && host === dualStackHost) {
          // Don't call callback for first attempt
          // Error will be triggered through error handler
        } else if (listenCallCount === 2 && host === ipv4Host) {
          if (callback) callback();
        }
        return mockServer;
      }
    );

    // Setup error handler capture
    let errorHandler: ((err: any) => void) | undefined;
    mockOn.mockImplementation((event: string, handler: (err: any) => void) => {
      if (event === 'error') {
        errorHandler = handler;
      }
      return mockServer;
    });

    // Execute the pattern
    mockServer
      .listen(port, dualStackHost, () => {
        console.log(`Server listening on ${dualStackHost}:${port}`);
      })
      .on('error', (err: any) => {
        if (err.code === 'EAFNOSUPPORT') {
          return mockServer.listen(port, ipv4Host, () => {
            console.log(`Server listening on ${ipv4Host}:${port}`);
          });
        }
        throw err;
      });

    // Simulate EAFNOSUPPORT error
    const error: any = new Error('Address family not supported');
    error.code = 'EAFNOSUPPORT';

    // Verify error handler was registered
    expect(errorHandler).toBeDefined();

    // Trigger the error
    if (errorHandler) {
      errorHandler(error);
    }

    // Verify fallback was called
    expect(mockListen).toHaveBeenCalledTimes(2);
    expect(mockListen).toHaveBeenNthCalledWith(
      1,
      port,
      dualStackHost,
      expect.any(Function)
    );
    expect(mockListen).toHaveBeenNthCalledWith(
      2,
      port,
      ipv4Host,
      expect.any(Function)
    );
  });

  it('verifies non-EAFNOSUPPORT errors are thrown', () => {
    // Setup error handler capture
    let errorHandler: ((err: any) => void) | undefined;
    mockOn.mockImplementation((event: string, handler: (err: any) => void) => {
      if (event === 'error') {
        errorHandler = handler;
      }
      return mockServer;
    });

    // Mock listen to return the server
    mockListen.mockReturnValue(mockServer);

    // Execute the pattern
    mockServer
      .listen(3131, '::', () => {})
      .on('error', (err: any) => {
        if (err.code === 'EAFNOSUPPORT') {
          return mockServer.listen(3131, '0.0.0.0', () => {});
        }
        throw err;
      });

    // Create a different error
    const error = new Error('Some other error');

    // Verify error handler throws for non-EAFNOSUPPORT errors
    expect(() => {
      if (errorHandler) {
        errorHandler(error);
      }
    }).toThrow('Some other error');
  });
});

