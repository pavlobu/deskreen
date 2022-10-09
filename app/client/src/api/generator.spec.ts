import generator from './generator';
import { TEST_PORT, TEST_HOST, TEST_PROTOCOL } from './mocks/generatorTestVariables';

describe('generator.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('when generator() is called properly', () => {
    it('should produce correct string', () => {
      const roomID = '333';

      const result = generator(roomID);

      expect(result).toMatch(
        `/${roomID}`
      );
    });
  });
});
