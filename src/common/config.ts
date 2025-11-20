/* istanbul ignore file */

let hostname;
let protocol;
let primaryPort;
let backupPort;

if (!hostname && !protocol && !primaryPort && !backupPort) {
	hostname = 'localhost';
	protocol = 'http';
	primaryPort = 3131;
	backupPort = 3132;
}

export default {
	hostname,
	protocol,
	primaryPort,
	backupPort,
};
