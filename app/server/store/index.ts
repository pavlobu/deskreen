import MemoryStore from './Memory';

let store: MemoryStore;

const getStore = () => {
  if (store === undefined) {
    store = new MemoryStore();
  }
  return store;
};

export default getStore;
