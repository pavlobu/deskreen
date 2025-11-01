import { DeskreenGlobal } from './initGlobals';

export const getDeskreenGlobal = (): DeskreenGlobal => {
  return global as unknown as DeskreenGlobal;
};
