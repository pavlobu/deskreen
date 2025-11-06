/* eslint-disable @typescript-eslint/no-explicit-any */

interface LocalPeerUser {
	username: string;
	id: string;
}

interface ProcessedPayload {
	toSend: ProcessedMessage;
	original: any;
}

export const process = (payload: ReceiveEncryptedMessagePayload): Promise<ProcessedMessage> =>
	Promise.resolve(payload as ProcessedMessage);

export const prepare = (payload: any, user: LocalPeerUser) =>
	new Promise<ProcessedPayload>((resolve) => {
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

		resolve({
			toSend: jsonToSend as ProcessedMessage,
			original: jsonToSend,
		});
	});
