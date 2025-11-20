export const VideoQuality = {
	Q_AUTO: 'Auto',
	Q_25_PERCENT: '25%',
	Q_40_PERCENT: '40%',
	Q_60_PERCENT: '60%',
	Q_80_PERCENT: '80%',
	Q_100_PERCENT: '100%',
} as const;

export type VideoQualityType = (typeof VideoQuality)[keyof typeof VideoQuality];
