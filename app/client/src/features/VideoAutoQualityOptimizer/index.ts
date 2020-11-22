import pixelmatch from 'pixelmatch';

export default class VideoAutoQualityOptimizer {
  video: any;

  canvas: any;

  prevFrame: any;

  largeMismatchFramesCount = 0;

  isRequestedHalfQuality = false;

  goodQualityCallback = () => {};

  halfQualityCallbak = () => {};

  constructor() {}

  setGoodQualityCallback(callback: () => void) {
    this.goodQualityCallback = callback;
  }

  setHalfQualityCallbak(callback: () => void) {
    this.halfQualityCallbak = callback;
  }

  startOptimizationLoop() {
    setInterval(() => {
      this.frameComparisonQualityOptimization();
    }, 1000);
  }

  frameComparisonQualityOptimization() {
    if (this.video && this.canvas) {
      if (this.video.videoWidth === 0 || this.video.videoHeight === 0) return;
      // scale the canvas accordingly
      this.canvas
        .getContext('2d')
        .clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = this.video.videoWidth / 8;
      this.canvas.height = this.video.videoHeight / 8;
      // draw the video at that frame
      this.canvas
        .getContext('2d')
        .drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      // convert it to a usable data URL
      let imageData = this.canvas
        .getContext('2d')
        .getImageData(0, 0, this.canvas.width, this.canvas.height);

      if (this.prevFrame) {
        try {
          const numMismatchedPixels = pixelmatch(
            this.prevFrame.data,
            imageData.data,
            null,
            this.canvas.width,
            this.canvas.height,
            { threshold: 0.1 }
          );
          const mismatchInPercent =
            numMismatchedPixels / (this.canvas.width * this.canvas.height);
          if (mismatchInPercent < 0.1 && this.largeMismatchFramesCount > 0) {
            this.largeMismatchFramesCount -= 1;
          } else if (mismatchInPercent < 0.1 && this.isRequestedHalfQuality) {
            this.largeMismatchFramesCount = 0;
            this.isRequestedHalfQuality = false;
            // this.peer.send('set good quality');
            this.goodQualityCallback();
          } else if (mismatchInPercent >= 0.1 && !this.isRequestedHalfQuality) {
            if (this.largeMismatchFramesCount < 3) {
              this.largeMismatchFramesCount += 1;
            } else {
              // this.peer.send('set half quality');
              this.halfQualityCallbak();
              this.isRequestedHalfQuality = true;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      this.prevFrame = imageData;
      imageData = null;
    } else {
      this.video = document.querySelector(
        '#video-local-test-peer-sees > video'
      );
      this.canvas = document.getElementById('comparison-canvas');
    }
  }
}
