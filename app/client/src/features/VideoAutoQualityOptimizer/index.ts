import { COMPARISON_CANVAS_ID } from './../../constants/appConstants';
import pixelmatch from 'pixelmatch';
import { REACT_PLAYER_WRAPPER_ID } from '../../constants/appConstants';
import CanvasNotDefinedError from './errors/CanvasNotDefinedError';
import VideoDimensionsAreWrongError from './errors/VideoDimensionsAreWrongError';
import VideoNotDefinedError from './errors/VideoNotDefinedError';
import ImageDataIsUndefinedError from './errors/ImageDataIsUndefinedError';

export const CANVAS_SCALE_MULTIPLIER = 0.125; // 1/8 of original canvas size, to speed up calculations
export const MISMATCH_PERCENT_THRESHOLD = 0.1;

export default class VideoAutoQualityOptimizer {
  video: undefined | HTMLVideoElement;

  canvas: undefined | HTMLCanvasElement;

  prevFrame: undefined | ImageData;

  largeMismatchFramesCount = 0;

  isRequestedHalfQuality = false;

  goodQualityCallback = () => {};

  halfQualityCallbak = () => {};

  setGoodQualityCallback(callback: () => void) {
    this.goodQualityCallback = callback;
  }

  setHalfQualityCallbak(callback: () => void) {
    this.halfQualityCallbak = callback;
  }

  startOptimizationLoop() {
    this.prepareCanvasAndVideo();
    setInterval(() => {
      try {
        this.doFrameComparisonAndQualityOptimization();
      } catch (e) {
        // some errors may be thrown here, better ignore them in production
        if (process.env.NODE_ENV === 'development') {
          console.error(e);
        }
      }
    }, 1000);
  }

  doFrameComparisonAndQualityOptimization() {
    this.validateBeforeCalculations();
    this.clearCanvas();
    this.scaleCanvas();
    this.drawVideoFrameToCanvas();
    let imageData = this.getImageDataFromCanvas();

    if (!imageData) {
      throw new ImageDataIsUndefinedError();
    }
    if (!this.prevFrame) {
      this.prevFrame = imageData;
      return;
    }

    try {
      const mismatchInPercent = this.getPreviousAndCurrentFrameMismatchInPercent(imageData);
      this.handleFramesMismatch(mismatchInPercent);
    } catch (e) {
      // usually frames size mismatch thrown here, so can be ignored as it happens
      // often when changing sharing window size
      // so logging this error may be not necessary
    }

    this.prevFrame = imageData;
  }

  findAndSetVideoInternalVariable(document: Document) {
    this.video = document.querySelector(
      `#${REACT_PLAYER_WRAPPER_ID} > video`
    ) as HTMLVideoElement;
  }

  findAndSetCanvasInternalVariable(document: Document) {
    this.canvas = document.querySelector(
      `#${COMPARISON_CANVAS_ID}`
    ) as HTMLCanvasElement;
  }

  prepareCanvasAndVideo() {
    setTimeout(() => {
      this.findAndSetVideoInternalVariable(document);
      this.findAndSetCanvasInternalVariable(document);
    }, 1000);
  }

  clearCanvas() {
    this.canvas
      ?.getContext('2d')
      ?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  validateVideoWidthAndHeight() {
    if (this.video?.videoWidth === 0 || this.video?.videoHeight === 0) {
      throw new VideoDimensionsAreWrongError();
    }
  }

  validateBeforeCalculations() {
    this.validateVideoWidthAndHeight();
    this.validateVideoIsDefined();
    this.validateCanvasIsDefined();
  }

  validateVideoIsDefined() {
    if (!this.video) {
      throw new VideoNotDefinedError();
    }
  }

  validateCanvasIsDefined() {
    if (!this.canvas) {
      throw new CanvasNotDefinedError();
    }
  }

  scaleCanvas() {
    if (
      !this.canvas ||
      !this.video
    )
      return;
    this.canvas.width = this.video.videoWidth * CANVAS_SCALE_MULTIPLIER;
    this.canvas.height = this.video.videoHeight * CANVAS_SCALE_MULTIPLIER;
  }

  drawVideoFrameToCanvas() {
    if (!this.video) return;
    this.canvas
      ?.getContext('2d')
      ?.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
  }

  getImageDataFromCanvas() {
    return this.canvas
      ?.getContext('2d')
      ?.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  getNumberOfMismatchedPixels(imageData: ImageData) {
    if (!this.canvas || !this.canvas.width || !this.prevFrame) return 0;
    return pixelmatch(
      this.prevFrame.data,
      imageData.data,
      null,
      this.canvas.width,
      this.canvas.height,
      { threshold: 0.1 }
    );
  }

  getPreviousAndCurrentFrameMismatchInPercent(imageData: ImageData) {
    if (!this.canvas) return 0;
    return this.getNumberOfMismatchedPixels(imageData) / (this.canvas.width * this.canvas.height);
  }

  handleFramesMismatch(mismatchInPercent: number) {
    if (mismatchInPercent < 0.1 && this.largeMismatchFramesCount > 0) {
      this.largeMismatchFramesCount -= 1;
    } else if (mismatchInPercent < 0.1 && this.isRequestedHalfQuality) {
      this.largeMismatchFramesCount = 0;
      this.isRequestedHalfQuality = false;
      this.goodQualityCallback();
    } else if (mismatchInPercent >= 0.1 && !this.isRequestedHalfQuality) {
      if (this.largeMismatchFramesCount < 3) {
        this.largeMismatchFramesCount += 1;
      } else {
        this.halfQualityCallbak();
        this.isRequestedHalfQuality = true;
      }
    }
  }


  isLowMismatchPercent(mismatchInPercent: number) {
    return mismatchInPercent < MISMATCH_PERCENT_THRESHOLD;
  }

  isHighMismatchPercent(mismatchInPercent: number) {
    return mismatchInPercent >= MISMATCH_PERCENT_THRESHOLD;
  }
}
