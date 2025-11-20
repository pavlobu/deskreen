import { resolve } from 'path';
import {
	defineConfig,
	externalizeDepsPlugin,
	bytecodePlugin,
} from 'electron-vite';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import react from '@vitejs/plugin-react';
import fs from 'fs-extra';

// Custom Vite plugin to copy the 'client-viewer/dist' directory
const copyClientViewerStaticFiles = () => {
	return {
		name: 'copy-client-viewer-static-files', // A unique name for your plugin
		// The 'writeBundle' hook runs after the bundles have been written to disk
		async writeBundle() {
			const sourceDir = resolve(__dirname, 'src/client-viewer/dist');
			const destDir = resolve(__dirname, 'out/client-viewer');

			console.log(`Attempting to copy static files from: ${sourceDir}`);
			console.log(`To destination: ${destDir}`);

			try {
				// Ensure the destination directory exists and is empty before copying
				await fs.emptyDir(destDir);
				// Copy the entire contents of the source directory to the destination
				await fs.copy(sourceDir, destDir);
				console.log(
					'Successfully copied client-viewer/dist to out/client-viewer',
				);
			} catch (err) {
				console.error(`Error copying static files: ${err}`);
			}
		},
	};
};

const copySimplePeerMinJsStaticFiles = () => {
	return {
		name: 'copy-simple-peer-min-js-static-files',
		async writeBundle() {
			const sourceFile = resolve(
				__dirname,
				'node_modules/simple-peer/simplepeer.min.js',
			);
			const destDir = resolve(__dirname, 'out/renderer/assets');

			console.log(`Attempting to copy simple-peer.min.js from: ${sourceFile}`);
			console.log(`To destination: ${destDir}`);

			try {
				// Ensure the destination directory exists
				await fs.ensureDir(destDir);
				// Copy the file to the destination
				await fs.copyFile(sourceFile, resolve(destDir, 'simplepeer.min.js'));
				console.log(
					'Successfully copied simple-peer.min.js to out/client-viewer/static/js',
				);
			} catch (err) {
				console.error(`Error copying simple-peer.min.js: ${err}`);
			}
		},
	};
};

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin(), bytecodePlugin()],
	},
	preload: {
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'src/preload/index.ts'),
					helperRenderer: resolve(__dirname, 'src/preload/index.ts'),
					// webview: resolve(__dirname, 'src/preload/webview.js')
				},
			},
		},
		plugins: [externalizeDepsPlugin(), bytecodePlugin()],
	},
	renderer: {
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'src/renderer/index.html'),
					helperRenderer: resolve(
						__dirname,
						'src/renderer/peerConnectionHelperRendererWindowIndex.html',
					),
				},
			},
		},
		resolve: {
			alias: {
				'@renderer': resolve('src/renderer/src'),
				'@common': resolve('src/common'),
			},
		},
		plugins: [
			react(),
			copyClientViewerStaticFiles(),
			copySimplePeerMinJsStaticFiles(),
		],
	},
});
