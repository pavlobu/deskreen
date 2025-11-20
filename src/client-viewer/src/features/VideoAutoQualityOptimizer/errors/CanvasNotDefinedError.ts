export default class CanvasNotDefinedError extends Error {
	constructor() {
		super('internal variable of canvas DOM element should be defined!');
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, CanvasNotDefinedError.prototype);
	}
}
