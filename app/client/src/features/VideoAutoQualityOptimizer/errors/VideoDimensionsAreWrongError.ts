export default class VideoDimensionsAreWrongError extends Error {
  constructor() {
    super(
      'video dimensions are wrong, neither width nor height can be zero!'
    );
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, VideoDimensionsAreWrongError.prototype);
  }
}
