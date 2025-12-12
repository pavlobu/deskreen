import os from 'os';
import { interfacesToCheck, interfacesStartsWithCheck } from './getMyLocalIpV4';

export default function isWifiConnected(): boolean {
	const networkInterfaces = os.networkInterfaces();
	let hasValidInterface = false;
	Object.entries(networkInterfaces).some(([networksKey, networks]) => {
		if (!networks) return false;
		if (networksKey.startsWith('bridge')) return false;
		if (
			!interfacesToCheck.includes(networksKey) &&
			!interfacesStartsWithCheck.some((prefix) =>
				networksKey.startsWith(prefix),
			)
		) {
			return false;
		}

		const hasValidNetwork = networks.some((network) => {
			if (!network.internal && network.family === 'IPv4') {
				hasValidInterface = true;
				return true;
			}
			return false;
		});

		return hasValidNetwork;
	});

	return hasValidInterface;
}
