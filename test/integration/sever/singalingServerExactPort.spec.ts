import 'regenerator-runtime/runtime';
import signalingServer from '../../../app/server/signalingServer';
import getRandomPort from '../../../app/utils/server/getRandomPort';

jest.mock('../../../app/utils/server/getRandomPort');

const startServerWithMockedPort = async (mockedPort) => {
  signalingServer.stop();
  getRandomPort.mockReturnValue(Promise.resolve(mockedPort));
  await signalingServer.start();
};
test('should have exact port number as getRandomPort provided', async () => {
  const expectedPort = 3333;
  await startServerWithMockedPort(expectedPort);
  expect(signalingServer.server.address().port).toBe(expectedPort);
  signalingServer.stop();
});
