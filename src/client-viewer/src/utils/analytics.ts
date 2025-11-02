// google analytics type declarations
declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}
}

const CONSENT_KEY = 'deskreen_ga_consent';
const GA_TAG_PLACEHOLDER = '%VITE_CLIENT_VIEWER_GA_TAG%';
const CLIENT_VIEWER_VERSION_PLACEHOLDER = '%VITE_CLIENT_VIEWER_VERSION%';

let versionEventSent = false;

type AnalyticsEventParams = Record<string, string | number | boolean>;

export type ConsentStatus = 'accepted' | 'opted-out' | null;

export function getConsentStatus(): ConsentStatus {
	if (typeof window === 'undefined') {
		return null;
	}

	const stored = localStorage.getItem(CONSENT_KEY);
	if (stored === 'accepted' || stored === 'opted-out') {
		return stored;
	}
	return null;
}

export function setConsentStatus(status: 'accepted' | 'opted-out'): void {
	if (typeof window === 'undefined') {
		return;
	}
	localStorage.setItem(CONSENT_KEY, status);
}

export function clearConsentStatus(): void {
	if (typeof window === 'undefined') {
		return;
	}
	localStorage.removeItem(CONSENT_KEY);
}

export function loadGoogleAnalytics(gaTagId: string): void {
	if (typeof window === 'undefined' || !gaTagId || gaTagId === GA_TAG_PLACEHOLDER) {
		return;
	}

	// check if GA script is already loaded in DOM (from HTML)
	const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
	if (existingScript && window.dataLayer && typeof window.gtag === 'function') {
		// GA is already loaded from HTML, just update consent and send page_view
		const consentStatus = getConsentStatus();
		const analyticsConsent = consentStatus === 'accepted' ? 'granted' : 'denied';

		// update consent mode
		window.gtag('consent', 'update', {
			analytics_storage: analyticsConsent,
			ad_storage: 'denied'
		});

		// if user has consent, wait for GA to be ready and send page_view
		if (analyticsConsent === 'granted') {
			waitForGAReady(() => {
				sendPageView();
			});
		}
		return;
	}

	// initialize dataLayer BEFORE gtag.js loads (required for consent mode)
	window.dataLayer = window.dataLayer || [];

	function gtag(...args: unknown[]) {
		window.dataLayer.push(args);
	}

	window.gtag = gtag;
	gtag('js', new Date());

	// set default consent mode to denied (will be updated when user accepts)
	gtag('consent', 'default', {
		analytics_storage: 'denied',
		ad_storage: 'denied'
	});

	// load gtag.js script
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${gaTagId}`;

	script.onload = () => {
		// configure GA after script loads
		const consentStatus = getConsentStatus();
		const analyticsConsent = consentStatus === 'accepted' ? 'granted' : 'denied';

		window.gtag('config', gaTagId, {
			send_page_view: true,
			anonymize_ip: true
		});

		// update consent mode based on current status
		window.gtag('consent', 'update', {
			analytics_storage: analyticsConsent,
			ad_storage: 'denied'
		});

		// send page_view event after script is ready
		if (analyticsConsent === 'granted') {
			waitForGAReady(() => {
				sendPageView();
			});
		}
	};

	document.head.appendChild(script);
}

function sendPageView(): void {
	if (typeof window === 'undefined' || !window.gtag) {
		return;
	}

	// send page_view event with proper GA4 format for real-time tracking
	trackAnalyticsEvent('page_view', {
		page_title: document.title,
		page_location: window.location.href,
		page_path: window.location.pathname
	});

	sendClientViewerVersionEvent();
}

function waitForGAReady(callback: () => void): void {
	if (typeof window === 'undefined') {
		return;
	}

	// check if GA script exists
	const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');

	if (!script || typeof window.gtag !== 'function' || !window.dataLayer) {
		// if script not loaded yet, wait for window load event
		if (document.readyState === 'loading') {
			window.addEventListener('load', () => {
				setTimeout(callback, 300);
			});
		} else {
			// document already loaded, wait a bit for GA to initialize
			setTimeout(() => {
				if (typeof window.gtag === 'function' && window.dataLayer) {
					callback();
				}
			}, 300);
		}
		return;
	}

	// script exists, wait for GA to fully initialize
	// if document is already loaded, GA should be ready soon
	if (document.readyState === 'complete') {
		setTimeout(callback, 200);
	} else {
		// wait for document to finish loading first
		window.addEventListener('load', () => {
			setTimeout(callback, 200);
		});
	}
}

export function updateAnalyticsConsent(consentStatus: ConsentStatus): void {
	if (typeof window === 'undefined' || !window.dataLayer) {
		return;
	}

	const analyticsConsent = consentStatus === 'accepted' ? 'granted' : 'denied';

	// update consent mode
	if (window.gtag) {
		window.gtag('consent', 'update', {
			analytics_storage: analyticsConsent,
			ad_storage: 'denied'
		});

		// if consent granted, send page_view event after GA is ready
		if (analyticsConsent === 'granted') {
			waitForGAReady(() => {
				sendPageView();
			});
		}
	} else {
		// queue consent update if gtag not ready yet
		window.dataLayer.push(['consent', 'update', {
			analytics_storage: analyticsConsent,
			ad_storage: 'denied'
		}]);

		// if consent granted, queue page_view for when GA loads
		if (analyticsConsent === 'granted') {
			waitForGAReady(() => {
				sendPageView();
			});
		}
	}
}

export function getGaTagIdFromMeta(): string | null {
	const metaTag = document.querySelector('meta[name="ga-tag-id"]');
	if (metaTag) {
		return metaTag.getAttribute('content');
	}

	// fallback: try to extract from any existing script tags
	const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
	for (const script of scripts) {
		const src = script.getAttribute('src');
		if (src) {
			const match = src.match(/id=([^&]+)/);
			if (match && match[1] !== GA_TAG_PLACEHOLDER) {
				return match[1];
			}
		}
	}

	return null;
}

function getClientViewerVersion(): string | null {
	if (typeof window === 'undefined') {
		return null;
	}

	const metaTag = document.querySelector('meta[name="client-viewer-version"]');
	if (!metaTag) {
		return null;
	}

	const version = metaTag.getAttribute('content');
	if (!version || version === CLIENT_VIEWER_VERSION_PLACEHOLDER) {
		return null;
	}

	return version;
}

function sendClientViewerVersionEvent(): void {
	if (versionEventSent || typeof window === 'undefined' || !window.gtag) {
		return;
	}

	const version = getClientViewerVersion();
	if (!version) {
		return;
	}

	versionEventSent = true;
	trackAnalyticsEvent('client_viewer_version', {
		client_viewer_version: version
	});
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsEventParams = {}): void {
	if (typeof window === 'undefined') {
		return;
	}

	if (typeof window.gtag === 'function') {
		window.gtag('event', eventName, params);
		return;
	}

	if (window.dataLayer && typeof (window.dataLayer as unknown[]).push === 'function') {
		(window.dataLayer as unknown[]).push(['event', eventName, params]);
	}
}

