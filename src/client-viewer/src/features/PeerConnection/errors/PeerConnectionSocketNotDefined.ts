export default class PeerConnectionSocketNotDefined extends Error {
  constructor() {
    super('socket should be defined!');
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PeerConnectionSocketNotDefined.prototype);
  }
}
