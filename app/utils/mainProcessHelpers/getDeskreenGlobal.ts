import { DeskreenGlobal } from './DeskreenGlobal';

export default () => {
  return (global as unknown) as DeskreenGlobal;
};
