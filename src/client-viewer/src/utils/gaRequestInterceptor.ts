import { getConsentStatus } from './analytics';

const GA_DOMAINS = [
	'google-analytics.com',
	'googletagmanager.com',
	'google-analytics.co',
	'analytics.google.com',
	'region1.google-analytics.com',
	'region2.google-analytics.com',
	'region3.google-analytics.com',
	'region4.google-analytics.com',
	'region5.google-analytics.com',
	'region6.google-analytics.com',
	'region7.google-analytics.com',
	'region8.google-analytics.com',
	'region9.google-analytics.com',
	'region10.google-analytics.com',
	'region11.google-analytics.com',
	'region12.google-analytics.com',
	'region13.google-analytics.com',
	'region14.google-analytics.com',
	'region15.google-analytics.com',
	'region16.google-analytics.com',
	'region17.google-analytics.com',
	'region18.google-analytics.com',
	'region19.google-analytics.com',
	'region20.google-analytics.com',
];

function isGoogleAnalyticsUrl(url: string): boolean {
	try {
		const urlObj = new URL(url, window.location.href);
		const hostname = urlObj.hostname.toLowerCase();
		return GA_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
	} catch {
		return false;
	}
}

function shouldBlockRequest(): boolean {
	const consentStatus = getConsentStatus();
	return consentStatus !== 'accepted';
}

function isLocalIP(ip: string): boolean {
	const parts = ip.split('.').map(Number);
	if (parts.length !== 4 || parts.some(isNaN)) {
		return false;
	}

	// 127.0.0.0/8
	if (parts[0] === 127) {
		return true;
	}

	// 10.0.0.0/8
	if (parts[0] === 10) {
		return true;
	}

	// 172.16.0.0/12
	if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
		return true;
	}

	// 192.168.0.0/16
	if (parts[0] === 192 && parts[1] === 168) {
		return true;
	}

	return false;
}

function sanitizeGAUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		
		// only sanitize /g/collect requests
		if (!urlObj.pathname.includes('/g/collect')) {
			return url;
		}

		const dlParam = urlObj.searchParams.get('dl');
		if (!dlParam) {
			return url;
		}

		try {
			const dlUrl = new URL(decodeURIComponent(dlParam));
			const hostname = dlUrl.hostname;

			// check if hostname is a local IP address
			if (isLocalIP(hostname)) {
				urlObj.searchParams.set('dl', encodeURIComponent('http://localhost'));
				return urlObj.toString();
			}
		} catch {
			// if dl parameter is not a valid URL, leave it as is
		}

		return url;
	} catch {
		return url;
	}
}

let originalFetch: typeof fetch;
let originalXHROpen: typeof XMLHttpRequest.prototype.open;
let originalXHRSend: typeof XMLHttpRequest.prototype.send;
let originalSendBeacon: typeof navigator.sendBeacon;

function interceptFetch(): void {
	if (typeof window === 'undefined' || window.fetch === originalFetch) {
		return;
	}

	originalFetch = window.fetch;

	window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
		let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');

		if (isGoogleAnalyticsUrl(url)) {
			if (shouldBlockRequest()) {
				return Promise.reject(new Error('Google Analytics request blocked: user consent not granted'));
			}
			// sanitize URL before making request
			url = sanitizeGAUrl(url);
			// if input was a Request object, we need to create a new one with sanitized URL
			if (input instanceof Request) {
				input = new Request(url, init || input);
			} else {
				input = url;
			}
		}

		return originalFetch.call(this, input, init);
	};
}

function interceptXMLHttpRequest(): void {
	if (typeof window === 'undefined' || !window.XMLHttpRequest) {
		return;
	}

	const XHR = window.XMLHttpRequest;
	if (XHR.prototype.open === originalXHROpen) {
		return;
	}

	originalXHROpen = XHR.prototype.open;
	originalXHRSend = XHR.prototype.send;

	XHR.prototype.open = function(...args: unknown[]) {
		let url = args[1] as string | URL;
		let urlString = typeof url === 'string' ? url : url.toString();

		if (isGoogleAnalyticsUrl(urlString)) {
			if (shouldBlockRequest()) {
				throw new Error('Google Analytics request blocked: user consent not granted');
			}
			// sanitize URL before making request
			urlString = sanitizeGAUrl(urlString);
			url = urlString;
			args[1] = url;
		}

		(this as XMLHttpRequest & { _interceptedUrl?: string })._interceptedUrl = urlString;

		return (originalXHROpen as (...args: unknown[]) => void).apply(this, args);
	};

	XHR.prototype.send = function(...args) {
		const url = (this as XMLHttpRequest & { _interceptedUrl?: string })._interceptedUrl || '';

		if (isGoogleAnalyticsUrl(url) && shouldBlockRequest()) {
			return;
		}

		return originalXHRSend.apply(this, args);
	};
}

function interceptSendBeacon(): void {
	if (typeof window === 'undefined' || !navigator.sendBeacon || navigator.sendBeacon === originalSendBeacon) {
		return;
	}

	originalSendBeacon = navigator.sendBeacon;

	navigator.sendBeacon = function(url: string | URL, data?: BodyInit | null): boolean {
		let urlString = typeof url === 'string' ? url : url.toString();

		if (isGoogleAnalyticsUrl(urlString)) {
			if (shouldBlockRequest()) {
				return false;
			}
			// sanitize URL before making request
			urlString = sanitizeGAUrl(urlString);
			url = urlString;
		}

		return originalSendBeacon.call(this, url, data);
	};
}

export function initializeGARequestInterceptor(): void {
	if (typeof window === 'undefined') {
		return;
	}

	interceptFetch();
	interceptXMLHttpRequest();
	interceptSendBeacon();
}

