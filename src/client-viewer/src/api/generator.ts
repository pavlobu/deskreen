import config from './config';

export const generateUrl = (resourceName = '') => {
	const { port, protocol, host } = config;

	const resourcePath = resourceName;

	if (!host) {
		return `/localhost`;
	}

	return `${protocol}://${host}:${port}/${resourcePath}`;
};

export default {
	generateUrl,
};
