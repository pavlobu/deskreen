// import Store from 'electron-store';
//
// export const store = new Store() as unknown as {
//   has: (key: string) => boolean;
//   get: (key: string) => any;
//   delete: (key: string) => void;
//   set: (key: string, value: any) => void;
// };

// In an Electron app, it's best to use the built-in 'app' module
// to get the correct path for user data.
// In a standalone script, you could use os.homedir() and a custom directory.
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Define the shape of our store's data.
// This generic allows the storage class to be type-safe.
export type DataStore = Record<string, string>;

/**
 * A simple file-based key-value store for Electron applications.
 * Data is persisted to a JSON file in the user's data directory.
 */
const readDataFromDisk = (filePath: string): DataStore => {
	try {
		// Read the file synchronously to ensure data is loaded before any operations.
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(fileContent) as DataStore;
	} catch (_error) {
		// If the file doesn't exist or is invalid JSON, return an empty object.
		return {};
	}
};

export class PersistentStorage {
	private filePath: string;
	private data: DataStore;

	/**
	 * @param fileName The name of the file to save the data to. Defaults to 'deskreen-ce-storage.json'.
	 */
	constructor(fileName = 'deskreen-ce-storage.json') {
		const userDataPath = app.getPath('userData');
		this.filePath = path.join(userDataPath, fileName);
		this.data = readDataFromDisk(this.filePath);
	}

	/**
	 * Writes the current data object to the JSON file.
	 */
	private writeData(): void {
		try {
			// Use writeFileSync for synchronous writing. This is generally safe for app settings
			// and ensures the data is saved before the app exits.
			const jsonContent = JSON.stringify(this.data, null, 2);
			fs.writeFileSync(this.filePath, jsonContent, 'utf-8');
		} catch (error) {
			console.error('Failed to write data to file:', error);
		}
	}

	/**
	 * Checks if a key exists in the store.
	 * @param key The key to check for.
	 * @returns `true` if the key exists, `false` otherwise.
	 */
	public has(key: string): boolean {
		return Object.hasOwn(this.data, key);
	}

	/**
	 * Gets a value from the store by its key.
	 * @param key The key to retrieve.
	 * @returns The value associated with the key, or `undefined` if not found.
	 */
	public get(key: string): string | undefined {
		return this.data[key];
	}

	/**
	 * Sets a value in the store.
	 * @param key The key to set.
	 * @param value The string value to store.
	 */
	public set(key: string, value: string): void {
		this.data[key] = value;
		this.writeData(); // Persist the change immediately.
	}

	/**
	 * Deletes a key-value pair from the store.
	 * @param key The key to delete.
	 */
	public delete(key: string): void {
		delete this.data[key];
		this.writeData(); // Persist the change immediately.
	}

	/**
	 * Clears all data from the store.
	 */
	public clear(): void {
		this.data = {};
		this.writeData();
	}
}

export const store = new PersistentStorage();
