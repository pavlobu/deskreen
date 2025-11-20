/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * */

type MemoryStoreBucket = Record<string, unknown>;
type MemoryStoreData = Record<string, MemoryStoreBucket>;

interface MemoryStoreParams {
	store: MemoryStoreData;
}

class MemoryStore implements MemoryStoreParams {
	store: MemoryStoreData;

	constructor() {
		this.store = {};
	}

	async get(key: string, field: string): Promise<unknown | null> {
		const bucket = this.store[key];
		if (bucket === undefined || bucket[field] === undefined) {
			return null;
		}
		return bucket[field];
	}

	async getAll(key: string): Promise<MemoryStoreBucket> {
		return this.store[key] ?? {};
	}

	async set(key: string, field: string, value: unknown): Promise<number> {
		const bucket = this.ensureBucket(key);
		bucket[field] = value;
		return 1;
	}

	async del(key: string, field: string): Promise<0 | 1> {
		const bucket = this.store[key];
		if (bucket === undefined || bucket[field] === undefined) {
			return 0;
		}
		delete bucket[field];
		return 1;
	}

	async inc(key: string, field: string, inc = 1): Promise<number> {
		const bucket = this.ensureBucket(key);
		const currentValue = bucket[field];
		const nextValue =
			typeof currentValue === 'number' ? currentValue + inc : inc;
		bucket[field] = nextValue;
		return nextValue;
	}

	private ensureBucket(key: string): MemoryStoreBucket {
		if (this.store[key] === undefined) {
			this.store[key] = {};
		}
		return this.store[key];
	}
}

export default MemoryStore;
