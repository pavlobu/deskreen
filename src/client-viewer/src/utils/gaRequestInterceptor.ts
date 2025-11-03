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
		const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');

		if (isGoogleAnalyticsUrl(url) && shouldBlockRequest()) {
			return Promise.reject(new Error('Google Analytics request blocked: user consent not granted'));
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
		const url = args[1] as string | URL;
		const urlString = typeof url === 'string' ? url : url.toString();

		if (isGoogleAnalyticsUrl(urlString) && shouldBlockRequest()) {
			throw new Error('Google Analytics request blocked: user consent not granted');
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
		const urlString = typeof url === 'string' ? url : url.toString();

		if (isGoogleAnalyticsUrl(urlString) && shouldBlockRequest()) {
			return false;
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

