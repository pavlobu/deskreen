/* eslint-disable @typescript-eslint/no-explicit-any */

/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * */

interface MemoryStoreParams {
  store: unknown;
}

class MemoryStore implements MemoryStoreParams {
  store: any;

  constructor() {
    this.store = {};
  }

  async get(key: string, field: any): Promise<any> {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return null;
    }
    return this.store[key][field];
  }

  async getAll(key: string): Promise<any> {
    if (this.store[key] === undefined) {
      return [];
    }

    return this.store[key];
  }

  async set(key: string, field: string, value: any): Promise<number> {
    if (this.store[key] === undefined) {
      this.store[key] = {};
    }
    this.store[key][field] = value;
    return 1;
  }

  async del(key: string, field: string): Promise<0 | 1> {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return 0;
    }
    delete this.store[key][field];
    return 1;
  }

  async inc(key: string, field: string, inc = 1): Promise<any> {
    this.store[key][field] += inc;
    return this.store[key][field];
  }
}

export default MemoryStore;
