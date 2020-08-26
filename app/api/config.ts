/* istanbul ignore file */
let host;
let protocol;
let port;

if (!host && !protocol && !port) {
  host = 'localhost';
  protocol = 'http';
  port = 3131; // TODO: read port from signaling server api
}

export default {
  host,
  port,
  protocol,
};
