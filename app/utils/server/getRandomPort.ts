import getPort from 'get-port';

export function shuffle(array: number[]) {
  array.sort(() => Math.random() - 0.5);
}

export default async (): Promise<number> => {
  let res = 3131;
  const range = Array.from(getPort.makeRange(2000, 9999));
  shuffle(range);
  res = await getPort({
    port: range,
  });
  return res;
};
