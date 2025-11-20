import setSdpMediaBitrate from './setSdpMediaBitrate';

export default (sdp: string): string => {
	let newSDP = sdp;
	newSDP = setSdpMediaBitrate(newSDP, 'video', 500000);
	return newSDP;
};
