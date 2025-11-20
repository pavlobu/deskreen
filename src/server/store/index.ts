import MemoryStore from './MemoryStore';

let store: MemoryStore;

const getStore = (): MemoryStore => {
	if (store === undefined) {
		store = new MemoryStore();
	}
	return store;
};

export default getStore;
