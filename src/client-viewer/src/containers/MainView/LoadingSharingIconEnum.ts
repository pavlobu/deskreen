export const LoadingSharingIconEnum = {
	DESKTOP: 'desktop',
	APPLICATION: 'application',
} as const;

export type LoadingSharingIconType =
	(typeof LoadingSharingIconEnum)[keyof typeof LoadingSharingIconEnum];
