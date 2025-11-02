import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'

interface PackageJson {
	version?: string
}

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as PackageJson
const clientViewerVersion = process.env.VITE_CLIENT_VIEWER_VERSION || packageJson.version || ''

// plugin to replace html placeholders with env variables
const replaceHtmlEnvPlugin = (): Plugin => {
	return {
		name: 'replace-html-env',
		transformIndexHtml(html) {
			const gaTagId = process.env.VITE_CLIENT_VIEWER_GA_TAG || ''
			return html
				.replace(/%VITE_CLIENT_VIEWER_GA_TAG%/g, gaTagId)
				.replace(/%VITE_CLIENT_VIEWER_VERSION%/g, clientViewerVersion)
		},
	}
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		legacy({
			targets: ['defaults', 'not IE 11'], // Or your specific browser targets
		}),
		nodePolyfills(),
		replaceHtmlEnvPlugin(),
	],
})
