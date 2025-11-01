export default class Crypto {
  private encodeUTF8(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private decodeUTF8(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  createEncryptDecryptKeys() {
    return new Promise<{ publicKey: Uint8Array; privateKey: Uint8Array }>((resolve) => {
      const keypair = window.api.naclBoxKeyPair();
      resolve({ publicKey: keypair.publicKey, privateKey: keypair.secretKey });
    });
  }

  exportKey(key: Uint8Array) {
    return new Promise<string>((resolve) => {
      resolve(this.bytesToBase64(key));
    });
  }

  importEncryptDecryptKey(keyBase64String: string) {
    return new Promise<Uint8Array>((resolve) => {
      resolve(this.base64ToBytes(keyBase64String));
    });
  }

  async seal(
    plaintext: string,
    recipientPublicKeyBase64: string,
    senderPrivateKeyBase64: string,
  ): Promise<{ ciphertext: string; nonce: string; senderPublicKey: string }> {
    const recipientPublicKey = this.base64ToBytes(recipientPublicKeyBase64);
    const senderSecretKey = this.base64ToBytes(senderPrivateKeyBase64);
    const senderPublicKey = window.api.naclBoxKeyPairFromSecretKey(senderSecretKey).publicKey;
    const nonce = window.api.naclRandomBytes(window.api.naclBoxNonceLength);
    const messageBytes = this.encodeUTF8(plaintext);
    const sealed = window.api.naclBox(messageBytes, nonce, recipientPublicKey, senderSecretKey);
    return {
      ciphertext: this.bytesToBase64(sealed),
      nonce: this.bytesToBase64(nonce),
      senderPublicKey: this.bytesToBase64(senderPublicKey),
    };
  }

  async open(
    ciphertextBase64: string,
    nonceBase64: string,
    senderPublicKeyBase64: string,
    recipientPrivateKeyBase64: string,
  ): Promise<string> {
    const boxBytes = this.base64ToBytes(ciphertextBase64);
    const nonce = this.base64ToBytes(nonceBase64);
    const senderPublicKey = this.base64ToBytes(senderPublicKeyBase64);
    const recipientSecretKey = this.base64ToBytes(recipientPrivateKeyBase64);
    const opened = window.api.naclBoxOpen(boxBytes, nonce, senderPublicKey, recipientSecretKey);
    if (!opened) {
      throw new Error('failed to decrypt message');
    }
    return this.decodeUTF8(opened);
  }
}
