export default class PeerConnectionPeerIsNullError extends Error {
	constructor() {
		super('peer of PeerConnection should not be null!');
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, PeerConnectionPeerIsNullError.prototype);
	}
}
