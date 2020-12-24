import { INPUTtestSdpMediaBitrate } from './mocks/INPUTvideo500000testSdpMediaBitrate';
import { OUTPUTtestSdpMediaBitrate } from './mocks/OUTPUTvideo500000testSdpMediaBitrate';
import setSdpMediaBitrate from './setSdpMediaBitrate';

describe('setSdpMediaBitrate', () => {
  describe('when setSdpMediaBitrate is called with sdp input', () => {
    it('should produce a result that should match with test sdp string', () => {
      const result = setSdpMediaBitrate(
        INPUTtestSdpMediaBitrate,
        'video',
        500000
      );

      expect(result).toMatch(OUTPUTtestSdpMediaBitrate);
    });
  });
});
