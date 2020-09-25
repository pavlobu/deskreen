export default function isProduction() {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.RUN_MODE !== 'dev' &&
    process.env.RUN_MODE !== 'test'
  );
  // return true; // for animations and other things debugging as in production mode
}
