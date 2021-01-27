interface ReceiveEncryptedMessagePayload {
  fromSocketID: string;
  payload: string;
  signature: string;
  iv: string;
  keys: { sessionKey: string; signingKey: string }[];
}
