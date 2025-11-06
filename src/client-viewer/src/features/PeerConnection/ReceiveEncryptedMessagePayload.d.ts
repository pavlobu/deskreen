interface ReceiveEncryptedMessagePayload {
  fromSocketID: string;
  type: string;
  payload: Record<string, unknown>;
}
