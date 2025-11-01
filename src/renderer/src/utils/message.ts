import Crypto from './crypto';
import { ProcessedMessage } from './handleRecieveEncryptedMessage';

const crypto = new Crypto();

interface EncryptedPayloadToSend {
	ciphertext: string;
	nonce: string;
	senderPublicKey: string;
}

interface ProcessedPayload {
	toSend: EncryptedPayloadToSend;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	original: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const process = (payload: any, privateKeyString: string): Promise<ProcessedMessage> => {
	return new Promise<ProcessedMessage>(async (resolve, reject): Promise<void> => {
		try {
			const decrypted = await crypto.open(
				payload.ciphertext,
				payload.nonce,
				payload.senderPublicKey,
				privateKeyString,
			);
			const payloadJson = JSON.parse(decrypted) as ProcessedMessage;
			resolve(payloadJson);
		} catch (e) {
			console.error('failed to decrypt/open message', e);
			reject(new Error('failed to decrypt/open message'));
		}
	});
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prepare = (payload: any, user: any, partner: any): Promise<ProcessedPayload> =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<ProcessedPayload>(async (resolve): Promise<void> => {
		const myUsername = user.username;
		const myId = user.id;
		const innerPayload = { ...payload.payload } as Record<string, unknown>;
		if (typeof (innerPayload as { text?: unknown }).text === 'string') {
			(innerPayload as { text?: string }).text = encodeURI(
				(innerPayload as { text?: string }).text as string,
			);
		}
		const jsonToSend = {
			...payload,
			payload: {
				...innerPayload,
				sender: myId,
				username: myUsername,
			},
		};
		const payloadBuffer = JSON.stringify(jsonToSend);

		const sealed = await crypto.seal(payloadBuffer, partner.publicKey, user.privateKey);

		resolve({
			toSend: {
				ciphertext: sealed.ciphertext,
				nonce: sealed.nonce,
				senderPublicKey: sealed.senderPublicKey,
			},
			original: jsonToSend,
		});
	});
