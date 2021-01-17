interface ReceiveEncryptedMessagePayload {
  payload: string;
  signature: string;
  iv: string;
  keys: { sessionKey: string; signingKey: string }[];
}
