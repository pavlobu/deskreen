/// <reference types="vite/client" />
type ConnectionIconType =
	| ConnectionIconEnum.FEED
	| ConnectionIconEnum.FEED_SUBSCRIBED;
type LoadingSharingIconType =
	| LoadingSharingIconEnum.DESKTOP
	| LoadingSharingIconEnum.APPLICATION;
type ScreenSharingSourceType =
	| ScreenSharingSourceEnum.SCREEN
	| ScreenSharingSourceEnum.WINDOW;
type CreatePeerConnectionUseEffectParams = {
	connectionRoomId: string;
	peer: undefined | PeerConnection;
	setMyDeviceDetails: (_: DeviceDetails) => void;
	setConnectionIconType: (_: ConnectionIconType) => void;
	setIsShownTextPrompt: (_: boolean) => void;
	setPromptStep: (_: number) => void;
	setScreenSharingSourceType: (_: ScreenSharingSourceType) => void;
	setDialogErrorMessage: (_: ErrorMessage) => void;
	setIsErrorDialogOpen: (_: boolean) => void;
	setUrl: (_: MediaStream | null) => void;
	setPeer: (_: undefined | PeerConnection) => void;
};
type handleDisplayingLoadingSharingIconLoopParams = {
	promptStep: number;
	url: MediaStream | null;
	setIsShownLoadingSharingIcon: (_: boolean) => void;
	loadingSharingIconType: LoadingSharingIconType;
	isShownLoadingSharingIcon: boolean;
	setLoadingSharingIconType: (_: LoadingSharingIconType) => void;
};

interface Document {
	/**
	 * Indicates whether the document is currently in the process of prerendering.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/prerendering
	 * @see https://wicg.github.io/nav-speculation/prerendering.html#document-prerendering
	 */
	prerendering?: boolean;

	/**
	 * An event handler for the prerenderingchange event, which is fired when
	 * a prerendered document is activated.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/prerenderingchange_event
	 */
	onprerenderingchange?: ((this: Document, ev: Event) => void) | null;
}
