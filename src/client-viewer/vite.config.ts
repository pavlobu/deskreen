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

// inline script to intercept GA requests before GA loads
const gaInterceptorScript = `
(function() {
	const CONSENT_KEY = 'deskreen_ga_consent';
	const GA_DOMAINS = ['google-analytics.com', 'googletagmanager.com', 'google-analytics.co', 'analytics.google.com'];
	
	for (let i = 1; i <= 20; i++) {
		GA_DOMAINS.push('region' + i + '.google-analytics.com');
	}
	
	function getConsentStatus() {
		try {
			const stored = localStorage.getItem(CONSENT_KEY);
			return stored === 'accepted' ? 'accepted' : null;
		} catch {
			return null;
		}
	}
	
	function isGoogleAnalyticsUrl(url) {
		try {
			const urlObj = new URL(url, window.location.href);
			const hostname = urlObj.hostname.toLowerCase();
			return GA_DOMAINS.some(function(domain) {
				return hostname === domain || hostname.endsWith('.' + domain);
			});
		} catch {
			return false;
		}
	}
	
	function shouldBlockRequest() {
		return getConsentStatus() !== 'accepted';
	}
	
	// intercept fetch
	if (window.fetch) {
		const originalFetch = window.fetch;
		window.fetch = function(input, init) {
			const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
			if (isGoogleAnalyticsUrl(url) && shouldBlockRequest()) {
				return Promise.reject(new Error('Google Analytics request blocked: user consent not granted'));
			}
			return originalFetch.apply(this, arguments);
		};
	}
	
	// intercept XMLHttpRequest
	if (window.XMLHttpRequest) {
		const XHR = window.XMLHttpRequest;
		const originalOpen = XHR.prototype.open;
		const originalSend = XHR.prototype.send;
		
		XHR.prototype.open = function(method, url) {
			const urlString = typeof url === 'string' ? url : url.toString();
			if (isGoogleAnalyticsUrl(urlString) && shouldBlockRequest()) {
				throw new Error('Google Analytics request blocked: user consent not granted');
			}
			this._interceptedUrl = urlString;
			return originalOpen.apply(this, arguments);
		};
		
		XHR.prototype.send = function() {
			const url = this._interceptedUrl || '';
			if (isGoogleAnalyticsUrl(url) && shouldBlockRequest()) {
				return;
			}
			return originalSend.apply(this, arguments);
		};
	}
	
	// intercept sendBeacon
	if (navigator.sendBeacon) {
		const originalSendBeacon = navigator.sendBeacon;
		navigator.sendBeacon = function(url, data) {
			const urlString = typeof url === 'string' ? url : url.toString();
			if (isGoogleAnalyticsUrl(urlString) && shouldBlockRequest()) {
				return false;
			}
			return originalSendBeacon.call(this, url, data);
		};
	}
})();
`;

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
