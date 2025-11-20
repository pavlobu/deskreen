let host;
let protocol;
let port;

if (!host && !protocol && !port) {
	host = window.location.host.split(':')[0];
	protocol = 'http';
	port = 3131;
}

export default {
	host,
	port,
	protocol,
};
