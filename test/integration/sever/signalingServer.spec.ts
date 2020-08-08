import 'regenerator-runtime/runtime';
import signalingServer from '../../../app/server/signalingServer';

describe('Signaling Server', () => {
  beforeEach(async () => {
    await signalingServer.start();
  });

  afterEach(() => {
    signalingServer.stop();
  });
  it('should start signaling server', async () => {
    expect(signalingServer.server.listening).toBe(true);
  });

  it('should stop signaling server', async () => {
    signalingServer.stop();
    expect(signalingServer.server.listening).toBe(false);
  });

  it('should have port number in range from 2000 to 9999', async () => {
    // eslint-disable-next-line prefer-destructuring
    const port = signalingServer.server.address().port;
    expect(port).toBeGreaterThanOrEqual(2000);
    expect(port).toBeLessThanOrEqual(9999);
  });
});
