export default class ImageDataIsUndefinedError extends Error {
	constructor() {
		super('imageData retrieved is undefined!');
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, ImageDataIsUndefinedError.prototype);
	}
}
