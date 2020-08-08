import 'regenerator-runtime/runtime';
import getRandomPort from '../../../app/utils/server/getRandomPort';

test('shold generate random port in range 2000 to 9999', async () => {
  const port = await getRandomPort();
  expect(port).toBeGreaterThanOrEqual(2000);
  expect(port).toBeLessThanOrEqual(9999);
});
