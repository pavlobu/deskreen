export default class PeerConnectionPartnerIsNotDefinedError extends Error {
	constructor() {
		super('partner should be defined!');
		// Set the prototype explicitly.
		Object.setPrototypeOf(
			this,
			PeerConnectionPartnerIsNotDefinedError.prototype,
		);
	}
}
