export default class VideoNotDefinedError extends Error {
  constructor() {
    super('internal variable of video DOM elemenent should be defined!');
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, VideoNotDefinedError.prototype);
  }
}
