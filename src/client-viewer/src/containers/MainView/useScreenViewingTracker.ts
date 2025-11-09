import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '../../utils/analytics';
import { type ErrorMessageType } from '../../components/ErrorDialog/ErrorMessageEnum';

interface UseScreenViewingTrackerParams {
	streamUrl: undefined | MediaStream;
	isPlaying: boolean;
	isErrorDialogOpen: boolean;
	dialogErrorMessage: ErrorMessageType;
}

function formatErrorMessageForEvent(errorMessage: ErrorMessageType): string {
	// convert error message to event-friendly format
	// e.g., "An unknown error occurred" -> "an_unknown_error_occurred"
	return errorMessage
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '_');
}

export function useScreenViewingTracker(params: UseScreenViewingTrackerParams): void {
	const { streamUrl, isPlaying, isErrorDialogOpen, dialogErrorMessage } = params;

	const startTimeRef = useRef<number | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const lastMinuteTrackedRef = useRef<number>(0);
	const errorEventSentRef = useRef<boolean>(false);
	const previousErrorDialogOpenRef = useRef<boolean>(false);
	const isErrorDialogOpenRef = useRef<boolean>(false);

	// determine if stream is currently visible (without error dialog check)
	const isStreamVisible = streamUrl !== undefined && isPlaying;

	// update error dialog ref
	isErrorDialogOpenRef.current = isErrorDialogOpen;

	// handle error dialog appearance
	useEffect(() => {
		// if error dialog just appeared and we were tracking
		if (isErrorDialogOpen && !previousErrorDialogOpenRef.current && startTimeRef.current !== null && !errorEventSentRef.current) {
			// clear interval
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}

			// calculate total minutes spent viewing
			const elapsedMs = Date.now() - startTimeRef.current;
			const elapsedMinutes = Math.floor(elapsedMs / 60000);
			const errorReason = formatErrorMessageForEvent(dialogErrorMessage);

			// send error event
			trackAnalyticsEvent(
				`error_dialog_reason_${errorReason}_spent_screen_viewing_${elapsedMinutes}_minutes`,
				{}
			);

			errorEventSentRef.current = true;
		}

		previousErrorDialogOpenRef.current = isErrorDialogOpen;
	}, [isErrorDialogOpen, dialogErrorMessage]);

	// handle stream visibility tracking
	useEffect(() => {
		// if stream becomes visible and no error dialog, start tracking
		if (isStreamVisible && !isErrorDialogOpen && startTimeRef.current === null) {
			startTimeRef.current = Date.now();
			lastMinuteTrackedRef.current = 0;
			errorEventSentRef.current = false;

			// set up interval to check every minute
			intervalRef.current = setInterval(() => {
				if (startTimeRef.current === null || isErrorDialogOpenRef.current) {
					return;
				}

				const elapsedMs = Date.now() - startTimeRef.current;
				const elapsedMinutes = Math.floor(elapsedMs / 60000);

				// send event for each new minute
				if (elapsedMinutes > lastMinuteTrackedRef.current) {
					lastMinuteTrackedRef.current = elapsedMinutes;
					trackAnalyticsEvent(`screen_viewing_${elapsedMinutes}_minutes`, {});
				}
			}, 60000); // check every minute
		}

		// if stream is not visible (and no error dialog), stop tracking and reset
		if ((!isStreamVisible || isErrorDialogOpen) && intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// reset tracking state when stream is not visible (only if no error dialog)
		if (!isStreamVisible && !isErrorDialogOpen) {
			startTimeRef.current = null;
			lastMinuteTrackedRef.current = 0;
			errorEventSentRef.current = false;
		}

		// if error dialog closes and stream is still visible, restart tracking
		if (!isErrorDialogOpen && previousErrorDialogOpenRef.current && isStreamVisible && errorEventSentRef.current) {
			// reset error event flag and restart tracking
			errorEventSentRef.current = false;
			startTimeRef.current = Date.now();
			lastMinuteTrackedRef.current = 0;

			// restart interval
			if (intervalRef.current === null) {
				intervalRef.current = setInterval(() => {
					if (startTimeRef.current === null || isErrorDialogOpenRef.current) {
						return;
					}

					const elapsedMs = Date.now() - startTimeRef.current;
					const elapsedMinutes = Math.floor(elapsedMs / 60000);

					// send event for each new minute
					if (elapsedMinutes > lastMinuteTrackedRef.current) {
						lastMinuteTrackedRef.current = elapsedMinutes;
						trackAnalyticsEvent(`screen_viewing_${elapsedMinutes}_minutes`, {});
					}
				}, 60000);
			}
		}

		// cleanup on unmount
		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isStreamVisible, isErrorDialogOpen]);
}

