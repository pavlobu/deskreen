import React, { useEffect, useState } from 'react';
import MainView from './containers/MainView';
import PrivacyConsentDialog from './components/PrivacyConsentDialog';
import { getConsentStatus, setConsentStatus, clearConsentStatus, loadGoogleAnalytics, getGaTagIdFromMeta, updateAnalyticsConsent } from './utils/analytics';

const App: React.FC = () => {
	// Helper function to check for prerendering safely
	const isCurrentlyPrerendering = () => {
		// Check if 'document' and 'prerendering' property exist
		return typeof document !== 'undefined' && typeof document.prerendering === 'boolean'
			? document.prerendering
			: false; // Default to false if the property doesn't exist
	};

	const [isTrulyVisible, setIsTrulyVisible] = useState(!isCurrentlyPrerendering());
	const [showConsentDialog, setShowConsentDialog] = useState(false);
	const [hasConsent, setHasConsent] = useState(false);

	useEffect(() => {
		// Only set up listeners if document.prerendering is supported
		if (typeof document !== 'undefined' && typeof document.prerendering === 'boolean') {
			const handlePrerenderChange = () => {
				// When the prerendering state changes, update isTrulyVisible
				// It becomes true when document.prerendering is false (i.e., page is activated)
				setIsTrulyVisible(!document.prerendering);
			};

			// If it was initially prerendering, listen for the change to activate.
			// The { once: true } option is useful if you only care about the first activation.
			// However, if a page could theoretically go back into a prerender state (less common for user navigation),
			// you might remove { once: true } but then also need more complex logic.
			// For the typical "prerender then activate" flow, { once: true } is fine.
			if (document.prerendering) {
				document.addEventListener('prerenderingchange', handlePrerenderChange, { once: true });
			}

			return () => {
				// Cleanup the event listener
				document.removeEventListener('prerenderingchange', handlePrerenderChange);
			};
		}
		// If document.prerendering is not supported, isTrulyVisible is already true
		// (due to the initial useState value and isCurrentlyPrerendering fallback),
		// so no specific effect logic is needed for that case here.
	}, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

	useEffect(() => {
		if (!isTrulyVisible) {
			return;
		}

		// check consent status first
		const consentStatus = getConsentStatus();

		// load GA immediately when page is visible (before consent)
		const gaTagId = getGaTagIdFromMeta();
		if (gaTagId && gaTagId !== '%VITE_CLIENT_VIEWER_GA_TAG%') {
			loadGoogleAnalytics(gaTagId);

			// if user previously accepted consent, ensure page_view is sent
			if (consentStatus === 'accepted') {
				// wait a bit for GA to load, then update consent and send page_view
				setTimeout(() => {
					updateAnalyticsConsent('accepted');
				}, 500);
			}
		}

		if (consentStatus === 'accepted') {
			setHasConsent(true);
		} else {
			// no consent or opted out - show dialog
			setShowConsentDialog(true);
		}
	}, [isTrulyVisible]);

	const handleAccept = () => {
		setConsentStatus('accepted');
		setShowConsentDialog(false);
		setHasConsent(true);

		// update GA consent to granted and send page_view
		updateAnalyticsConsent('accepted');
	};

	const handleOptOut = () => {
		// clear any stored consent so dialog shows again next time
		clearConsentStatus();
		setShowConsentDialog(false);
		setHasConsent(true);

		// redirect to google.com
		window.location.href = 'https://google.com';
	};

	if (!isTrulyVisible) {
		// Render a minimal version or nothing while the browser is prerendering.
		// This prevents heavy computations or API calls during the browser's prerender phase.
		// console.log("Page is being prerendered by the browser (or support for detection is present). Waiting for activation.");
		return <div>Loading preview (being prerendered)...</div>; // Or null, or a lightweight placeholder
	}

	if (!hasConsent) {
		return (
			<>
				<PrivacyConsentDialog
					isOpen={showConsentDialog}
					onAccept={handleAccept}
					onOptOut={handleOptOut}
				/>
			</>
		);
	}

	return (
		<MainView />
	);
};

export default App;
