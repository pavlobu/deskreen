import { prepare, process } from './message';
import getTestPublickKeyPem from './mocks/getTestPublickKeyPem';
import getTestPrivateKeyPem from './mocks/getTestPrivateKeyPem';

interface TestPayload {
  text: string;
}

interface TestDecryptedPayload {
  payload: TestPayload;
}
describe('message.ts tests for proper encryption and decryption functionality', () => {
  const TEST_TEXT = 'some test text here';
  const TEST_TEXT_AS_URL = 'some%20test%20text%20here';
  const testPayloadToEncrypt = {
    payload: {
      text: TEST_TEXT,
    },
  };

  const testUser = {
    username: 'testUsername',
    id: 'testId',
  };

  const testPartner = {
    publicKey: getTestPublickKeyPem(),
  };
  it('should create encrypted payload with prepare() method', async () => {
    const encryptedPayload = await prepare(
      testPayloadToEncrypt,
      testUser,
      testPartner
    );

    expect(encryptedPayload.toSend.payload).not.toContain(TEST_TEXT);
    expect(encryptedPayload.toSend.payload).not.toContain(TEST_TEXT_AS_URL);
  });

  it('should decrypt encrypted payload with process() method', async () => {
    const encryptedPayload = await prepare(
      testPayloadToEncrypt,
      testUser,
      testPartner
    );

    const decryptedPayload = await process(
      encryptedPayload.toSend,
      getTestPrivateKeyPem()
    );

    expect((decryptedPayload as TestDecryptedPayload).payload.text).toContain(
      TEST_TEXT_AS_URL
    );
  });
});
