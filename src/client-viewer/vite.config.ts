import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

interface PackageJson {
	version?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as PackageJson
const clientViewerVersion = process.env.VITE_CLIENT_VIEWER_VERSION || packageJson.version || ''

// load GA interceptor script from separate file
const gaInterceptorScript = readFileSync(join(__dirname, 'scripts', 'ga-interceptor.js'), 'utf-8')

// plugin to replace html placeholders with env variables and inject GA interceptor
const replaceHtmlEnvPlugin = (): Plugin => {
	return {
		name: 'replace-html-env',
		transformIndexHtml(html) {
			const gaTagId = process.env.VITE_CLIENT_VIEWER_GA_TAG || ''
			let transformed = html
				.replace(/%VITE_CLIENT_VIEWER_GA_TAG%/g, gaTagId)
				.replace(/%VITE_CLIENT_VIEWER_VERSION%/g, clientViewerVersion)
			
			// inject GA interceptor script before GA script loads
			if (transformed.includes('<script async src="https://www.googletagmanager.com/gtag/js')) {
				transformed = transformed.replace(
					'<script async src="https://www.googletagmanager.com/gtag/js',
					`<script>${gaInterceptorScript}</script>\n    <script async src="https://www.googletagmanager.com/gtag/js`
				)
			}
			
			return transformed
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
