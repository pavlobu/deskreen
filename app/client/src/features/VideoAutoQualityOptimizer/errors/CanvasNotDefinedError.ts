export default class CanvasNotDefinedError extends Error {
  constructor() {
    super('internal variable of canvas DOM elemenent should be defined!');
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CanvasNotDefinedError.prototype);
  }
}
