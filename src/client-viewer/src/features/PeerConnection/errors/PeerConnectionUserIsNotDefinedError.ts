export default class PeerConnectionUserIsNotDefinedError extends Error {
  constructor() {
    super('user should be defined!');
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PeerConnectionUserIsNotDefinedError.prototype);
  }
}
