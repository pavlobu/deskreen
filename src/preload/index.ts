import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import forge from 'node-forge';
// import SimplePeer from 'simple-peer';
// import wrtc from '@roamhq/wrtc';
// import * as SimplePeerMin from './simplepeer.min.js';

// Custom APIs for renderer
const api = {
	// SimplePeer: SimplePeer,
	// createSimplePeer: (opts) => {
	//   // Merge user-provided options with the wrtc module
	//   // This ensures SimplePeer uses the wrtc loaded in the preload process.
	//   return new SimplePeer({ ...opts });
	// },
	// SimplePeerMin: SimplePeerMin,
	// wrtc: wrtc,
	forge: forge,
	Buffer: Buffer,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI);
		contextBridge.exposeInMainWorld('api', api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}
