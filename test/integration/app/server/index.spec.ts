import http from 'http';
import SignalingServer from '../../../../app/server/index';

describe('signaling server', () => {
  let server: typeof SignalingServer;
  beforeEach(() => {
    server = SignalingServer;
  });

  afterEach(() => {
    server.stop();
  });

  it('start() should return http.Server', async () => {
    const res = await server.start();
    expect(res instanceof http.Server).toBe(true);
  });
});
