/* eslint-disable @typescript-eslint/ban-ts-comment */
import { INPUTtestSdpMediaBitrate } from './mocks/INPUTvideo500000testSdpMediaBitrate';
import { OUTPUTtestSdpMediaBitrate } from './mocks/OUTPUTvideo500000testSdpMediaBitrate';
import simplePeerHandleSdpTransform from './simplePeerHandleSdpTransform';
import setSdpMediaBitrate from './setSdpMediaBitrate';

jest.useFakeTimers();
jest.mock('./setSdpMediaBitrate', () => {
  return jest.fn();
});

describe('when simplePeerHandleSdpTransform is called', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('should call setSdpMediaBitrate', () => {
    simplePeerHandleSdpTransform(INPUTtestSdpMediaBitrate);

    expect(setSdpMediaBitrate).toBeCalled();
  });

  it('should return proper sdp media bitrate', () => {
    // @ts-ignore
    setSdpMediaBitrate.mockImplementation(
      jest.requireActual('./setSdpMediaBitrate').default
    );

    const res = simplePeerHandleSdpTransform(INPUTtestSdpMediaBitrate);

    expect(res).toEqual(OUTPUTtestSdpMediaBitrate);
  });
});
