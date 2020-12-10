export default class ImageDataIsUndefinedError extends Error {
  constructor() {
    super('imageData retreived is undefined!');
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ImageDataIsUndefinedError.prototype);
  }
}
