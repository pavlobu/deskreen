/* istanbul ignore file */
import config from './config';

export default (resourceName = '') => {
  const { port, protocol, host } = config;

  const resourcePath = resourceName;

  if (!host) {
    return `/localhost`;
  }

  return `${protocol}://${host}:${port}/${resourcePath}`;
};
