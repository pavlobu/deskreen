// eslint-disable-next-line import/prefer-default-export
export function sanitize(str: string) {
  return str.replace(/[^A-Za-z0-9]/g, '-');
}
