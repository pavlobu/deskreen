interface ReceiveEncryptedMessagePayload {
  payload: string;
  fromSocketID: string;
  signature: string;
  iv: string;
  keys: { sessionKey: string; signingKey: string }[];
}
