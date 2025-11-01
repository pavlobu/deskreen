/* eslint-disable @typescript-eslint/no-explicit-any */
import setSdpMediaBitrate from './setSdpMediaBitrate';

export default (sdp: any): any => {
  let newSDP = sdp;
  newSDP = setSdpMediaBitrate(newSDP as string, 'video', 500000) as typeof sdp;
  return newSDP;
};
