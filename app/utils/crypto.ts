/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */

import forge from 'node-forge';

export default class Crypto {
  convertStringToArrayBufferView(str: string) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }

    return bytes;
  }

  // convertArrayBufferViewToString(buffer) {
  //   let str = '';
  //   for (let i = 0; i < buffer.byteLength; i++) {
  //     str += String.fromCharCode(buffer[i]);
  //   }

  //   return str;
  // }

  createEncryptDecryptKeys() {
    return new Promise<forge.pki.rsa.KeyPair>((resolve) => {
      const keypair = forge.pki.rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001,
      });
      resolve(keypair);
    });
  }

  encryptMessage(data: string, secretKey: string, iv: string) {
    return new Promise<string>((resolve) => {
      const input = forge.util.createBuffer(data, 'utf8');
      const cipherAES = forge.cipher.createCipher('AES-CBC', secretKey);
      cipherAES.start({ iv });
      cipherAES.update(input);
      cipherAES.finish();
      const cyphertext = cipherAES.output.getBytes();
      resolve(cyphertext);
    });
  }

  decryptMessage(data: string, secretKey: string, iv: string) {
    return new Promise<string>((resolve) => {
      const input = forge.util.createBuffer(data);
      const decipher = forge.cipher.createDecipher('AES-CBC', secretKey);
      decipher.start({ iv });
      decipher.update(input); // input should be a strng here
      decipher.finish();
      const decryptedPayload = decipher.output.toString();
      resolve(decryptedPayload);
    });
  }

  importEncryptDecryptKey(keyPemString: string) {
    return new Promise<forge.pki.rsa.PrivateKey | forge.pki.rsa.PublicKey>(
      (resolve) => {
        if (this.isPublicKeyString(keyPemString)) {
          const publicKeyPem = forge.pki.publicKeyFromPem(keyPemString);
          resolve(publicKeyPem);
        } else {
          const privateKeyPem = forge.pki.privateKeyFromPem(keyPemString);
          resolve(privateKeyPem);
        }
      }
    );
  }

  exportKey(key: forge.pki.rsa.PrivateKey | forge.pki.rsa.PublicKey) {
    return new Promise<string>((resolve) => {
      if (this.isPublicKeyObject(key)) {
        const publicKeyPem = forge.pki
          .publicKeyToPem(key as forge.pki.rsa.PublicKey)
          .toString();
        resolve(publicKeyPem);
      } else {
        const privateKeyPem = forge.pki
          .privateKeyToPem(key as forge.pki.rsa.PrivateKey)
          .toString();
        resolve(privateKeyPem);
      }
    });
  }

  signMessage(data: string, keyToSignWith: string) {
    return new Promise<string>((resolve) => {
      const hmac = forge.hmac.create();
      const input = forge.util.createBuffer(data, 'utf8');
      hmac.start('sha256', keyToSignWith);
      hmac.update(input);
      const signatureString = hmac.digest().getBytes();
      resolve(signatureString);
    });
  }

  verifyPayload(signature: string, data: string, secretKey: string) {
    return new Promise<boolean>((resolve) => {
      const hmac = forge.hmac.create();
      const input = forge.util.createBuffer(data, 'utf8');
      hmac.start('sha256', secretKey);
      hmac.update(input);
      const recreatedSignature = hmac.digest().getBytes();
      const verified = recreatedSignature === signature;
      resolve(verified);
    });
  }

  wrapKeyWithForge(
    keyToWrap: string,
    publicKeyToWrapWith: forge.pki.rsa.PublicKey
  ) {
    return publicKeyToWrapWith.encrypt(keyToWrap, 'RSA-OAEP');
  }

  unwrapKey(privateKey: forge.pki.rsa.PrivateKey, encryptedAESKey: string) {
    return privateKey.decrypt(encryptedAESKey, 'RSA-OAEP');
  }

  private isPublicKeyString(key: string) {
    return key.includes('PUBLIC KEY');
  }

  private isPublicKeyObject(
    key: forge.pki.rsa.PublicKey | forge.pki.rsa.PrivateKey
  ) {
    return (key as forge.pki.rsa.PublicKey).encrypt !== undefined;
  }
}
