/* eslint-disable @typescript-eslint/no-explicit-any */
import CodecsHandler from './CodecHandler';
import setSdpMediaBitrate from './setSdpMediaBitrate';

export default (sdp: any) => {
  let newSDP = sdp;
  // newSDP = setSdpMediaBitrate(newSDP as string, 'video', 500000) as typeof sdp;

  // newSDP = CodecsHandler.removeVPX(newSDP);

  newSDP = CodecsHandler.preferVP9(newSDP);
  // newSDP = CodecsHandler.preferCodec(newSDP, 'h264');
  newSDP = CodecsHandler.disableNACK(newSDP);
  newSDP = CodecsHandler.setVideoBitrates(newSDP, {
    min: 800000,
    max: 1000000,
  });
  newSDP = CodecsHandler.setApplicationSpecificBandwidth(
    newSDP,
    { screen: 800000 },
    true
  );
  return newSDP;
};
