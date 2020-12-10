import generator from './generator';
import { TEST_PORT, TEST_HOST, TEST_PROTOCOL } from './mocks/generatorTestVariables';

// how to use local variables in jest mock to get rid of hoisting mocks to top most code block:
//stackoverflow.com/questions/44649699/service-mocked-with-jest-causes-the-module-factory-of-jest-mock-is-not-allowe
jest.mock('./config', () => {
  const generatorTestVariables = require('./mocks/generatorTestVariables');

  return {
    host: generatorTestVariables.TEST_HOST,
    protocol: generatorTestVariables.TEST_PROTOCOL,
    port: generatorTestVariables.TEST_PORT,
  };
});


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
        `${TEST_PROTOCOL}://${TEST_HOST}:${TEST_PORT}/${roomID}`
      );
    });
  });
});
