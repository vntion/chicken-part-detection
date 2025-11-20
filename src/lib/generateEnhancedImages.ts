import cv from "@techstark/opencv-js";
import type { EnhancedImageResult } from "../types/EnhancedImageResult";

const matToUrl = (mat: cv.Mat): string => {
  const canvas = document.createElement("canvas");
  cv.imshow(canvas, mat);
  return canvas.toDataURL("image/png");
};

/**
 * Contrast Stretching
 */
const applyContrastStretching = (src: cv.Mat): string => {
  const dst = new cv.Mat();

  if (src.channels() >= 3) {
    const imgYCrCb = new cv.Mat();
    cv.cvtColor(src, imgYCrCb, cv.COLOR_RGBA2RGB);
    cv.cvtColor(imgYCrCb, imgYCrCb, cv.COLOR_RGB2YCrCb);

    const channels = new cv.MatVector();
    cv.split(imgYCrCb, channels);

    const yChannel = channels.get(0);
    const yNorm = new cv.Mat();
    cv.normalize(yChannel, yNorm, 0, 255, cv.NORM_MINMAX);
    channels.set(0, yNorm);

    cv.merge(channels, imgYCrCb);
    cv.cvtColor(imgYCrCb, dst, cv.COLOR_YCrCb2RGB);

    imgYCrCb.delete();
    channels.delete();
    yNorm.delete();
  } else {
    // Grayscale
    cv.normalize(src, dst, 0, 255, cv.NORM_MINMAX, cv.CV_8U);
  }

  const url = matToUrl(dst);
  dst.delete();
  return url;
};

/**
 * HE
 */
const applyHistogramEqualization = (src: cv.Mat): string => {
  const dst = new cv.Mat();
  const imgYCrCb = new cv.Mat();

  cv.cvtColor(src, imgYCrCb, cv.COLOR_RGBA2RGB);
  cv.cvtColor(imgYCrCb, imgYCrCb, cv.COLOR_RGB2YCrCb);

  const channels = new cv.MatVector();
  cv.split(imgYCrCb, channels);

  const yChannel = channels.get(0);
  const yEqualized = new cv.Mat();
  cv.equalizeHist(yChannel, yEqualized);

  channels.set(0, yEqualized);

  cv.merge(channels, imgYCrCb);
  cv.cvtColor(imgYCrCb, dst, cv.COLOR_YCrCb2RGB);

  const url = matToUrl(dst);

  dst.delete();
  imgYCrCb.delete();
  channels.delete();
  yEqualized.delete();

  return url;
};

/**
 * CLAHE
 */
const applyCLAHE = (src: cv.Mat): string => {
  const dst = new cv.Mat();
  const imgYCrCb = new cv.Mat();

  cv.cvtColor(src, imgYCrCb, cv.COLOR_RGBA2RGB);
  cv.cvtColor(imgYCrCb, imgYCrCb, cv.COLOR_RGB2YCrCb);

  const channels = new cv.MatVector();
  cv.split(imgYCrCb, channels);

  const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));

  const yChannel = channels.get(0);
  const yClahe = new cv.Mat();
  clahe.apply(yChannel, yClahe);

  channels.set(0, yClahe);

  cv.merge(channels, imgYCrCb);
  cv.cvtColor(imgYCrCb, dst, cv.COLOR_YCrCb2RGB);

  const url = matToUrl(dst);

  dst.delete();
  imgYCrCb.delete();
  channels.delete();
  clahe.delete();
  yClahe.delete();

  return url;
};

/**
 * Main function
 */
const generateEnhancedImages = async (
  imageElement: HTMLImageElement,
): Promise<EnhancedImageResult[]> => {
  try {
    const src = cv.imread(imageElement);

    const originalUrl = imageElement.src;
    const csUrl = applyContrastStretching(src);
    const heUrl = applyHistogramEqualization(src);
    const claheUrl = applyCLAHE(src);

    src.delete();

    return [
      { type: "Original", url: originalUrl },
      { type: "CS", url: csUrl },
      { type: "HE", url: heUrl },
      { type: "CLAHE", url: claheUrl },
    ];
  } catch (e) {
    console.error("OpenCV Error:", e);
    throw new Error("Gagal memproses gambar dengan OpenCV.");
  }
};

export default generateEnhancedImages;
