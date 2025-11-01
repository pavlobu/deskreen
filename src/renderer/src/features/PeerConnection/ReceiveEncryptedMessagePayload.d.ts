interface ReceiveEncryptedMessagePayload {
  fromSocketID: string;
  ciphertext: string;
  nonce: string;
  senderPublicKey: string;
}
