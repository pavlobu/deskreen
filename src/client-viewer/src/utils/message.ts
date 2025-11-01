/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
import Crypto from './crypto';

const crypto = new Crypto();

interface EncryptedPayloadToSend {
	ciphertext: string;
	nonce: string;
	senderPublicKey: string;
}

interface ProcessedPayload {
	toSend: EncryptedPayloadToSend;
	original: any;
}

export const process = (payload: any, privateKeyString: string) =>
	new Promise<ProcessedMessage>(async (resolve) => {
		const decrypted = await crypto.open(
			payload.ciphertext,
			payload.nonce,
			payload.senderPublicKey,
			privateKeyString
		);
		const payloadJson = JSON.parse(decrypted) as ProcessedMessage;
		resolve(payloadJson);
	});

export const prepare = (payload: any, user: any, partner: any) =>
	new Promise<ProcessedPayload>(async (resolve) => {
		const myUsername = user.username;
		const myId = user.id;
		const innerPayload = { ...payload.payload } as Record<string, unknown>;
		if (typeof (innerPayload as { text?: unknown }).text === 'string') {
			(innerPayload as { text?: string }).text = encodeURI(
				(innerPayload as { text?: string }).text as string
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
