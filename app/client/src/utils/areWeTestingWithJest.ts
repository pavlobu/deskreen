export default () => {
  return process.env.JEST_WORKER_ID !== undefined;
};
