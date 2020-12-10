export default () => {
  return encodeURI(window.location.pathname.replace('/', ''));
}
