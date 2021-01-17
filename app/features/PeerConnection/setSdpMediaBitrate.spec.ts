/* eslint-disable @typescript-eslint/ban-ts-comment */
import { INPUTtestSdpMediaBitrate } from './mocks/INPUTvideo500000testSdpMediaBitrate';
import { OUTPUTtestSdpMediaBitrate } from './mocks/OUTPUTvideo500000testSdpMediaBitrate';
import setSdpMediaBitrate from './setSdpMediaBitrate';

describe('when setSdpMediaBitrate is called', () => {
  it('should return proper sdp media bitrate', () => {
    const res = setSdpMediaBitrate(INPUTtestSdpMediaBitrate, 'video', 500000);

    expect(res).toEqual(OUTPUTtestSdpMediaBitrate);
  });
});
