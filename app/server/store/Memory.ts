/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Memory store more for testing purpose than production use.
 */

interface MemoryStoreParams {
  store: any;
  hasSocketAdapter: boolean;
}

class MemoryStore implements MemoryStoreParams {
  store: any;

  hasSocketAdapter: boolean;

  constructor() {
    this.store = {};
    this.hasSocketAdapter = false;
  }

  async get(key: string, field: any) {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return null;
    }
    return this.store[key][field];
  }

  async getAll(key: string) {
    if (this.store[key] === undefined) {
      return [];
    }

    return this.store[key];
  }

  async set(key: string, field: string, value: any) {
    if (this.store[key] === undefined) {
      this.store[key] = {};
    }
    this.store[key][field] = value;
    return 1;
  }

  async del(key: string, field: string) {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return 0;
    }
    delete this.store[key][field];
    return 1;
  }

  async inc(key: string, field: string, inc = 1) {
    this.store[key][field] += inc;
    return this.store[key][field];
  }
}

export default MemoryStore;
