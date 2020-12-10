import screenfull from "screenfull";

export default (setIsFullScreenOn: (_: boolean) => void) => {
  if (!screenfull.isEnabled) return;
  // @ts-ignore
  screenfull.on('change', () => {
    // @ts-ignore
    setIsFullScreenOn(screenfull.isFullscreen);
  });
};
