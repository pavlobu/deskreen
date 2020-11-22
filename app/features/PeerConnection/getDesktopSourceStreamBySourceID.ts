export default async (
  sourceID: string,
  width: number | null | undefined = undefined,
  height: number | null | undefined = undefined,
  minSizeDivisor = 1,
  maxSizeDivisor = 1,
  minFrameRate = 15,
  maxFrameRate = 60
) => {
  if (width && height) {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: fine here, mandatory does not exist, it's a problem with types
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceID,

          minWidth: width / minSizeDivisor,
          maxWidth: width / maxSizeDivisor,
          minHeight: height / minSizeDivisor,
          maxHeight: height / maxSizeDivisor,

          minFrameRate,
          maxFrameRate,
        },
      },
    });
  }

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: fine here, mandatory does not exist, it's a problem with types
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceID,
        minFrameRate,
        maxFrameRate,
      },
    },
  });
};
