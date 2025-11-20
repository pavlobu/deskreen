import { ProcessedMessage } from './handleRecieveEncryptedMessage';
import { LocalPeerUser } from '../../../common/LocalPeerUser';
import type { SendEncryptedMessagePayload } from '../../../common/SendEncryptedMessagePayload';

interface ProcessedPayload {
	toSend: ProcessedMessage;
	original: ProcessedMessage;
}

export const process = (
	payload: ReceiveEncryptedMessagePayload,
): Promise<ProcessedMessage> => {
	return Promise.resolve(payload as ProcessedMessage);
};

export const prepare = (
	payload: SendEncryptedMessagePayload,
	user: LocalPeerUser,
): Promise<ProcessedPayload> =>
	new Promise<ProcessedPayload>((resolve): void => {
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
		} as ProcessedMessage;

		resolve({
			toSend: jsonToSend,
			original: jsonToSend,
		});
	});
