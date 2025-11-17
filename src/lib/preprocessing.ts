import cv from "@techstark/opencv-js";
import { MODEL_HEIGTH, MODEL_WIDTH } from "./constants";

const preprocessing = (source: HTMLImageElement): [cv.Mat, number, number] => {
  const mat = cv.imread(source); // read image from HTML <img>
  const matC3 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3);
  cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR); // convert RGBA to BGR

  const maxSize = Math.max(matC3.rows, matC3.cols);
  const xPad = maxSize - matC3.cols;
  // const xRatio = maxSize / matC3.cols; // INI SALAH
  const yPad = maxSize - matC3.rows;
  // const yRatio = maxSize / matC3.rows; // INI SALAH

  // --- PERBAIKAN ---
  // Hitung rasio skaling dari ukuran input model (640x640)
  // ke ukuran gambar yang dipadding (maxSize x maxSize)
  // Ini adalah nilai yang dibutuhkan oleh detectImage.ts
  const scale_x = maxSize / MODEL_WIDTH;
  const scale_y = maxSize / MODEL_HEIGTH;
  // --- AKHIR PERBAIKAN ---

  const matPad = new cv.Mat();
  // Padding ditambahkan ke kanan (xPad) dan bawah (yPad)
  cv.copyMakeBorder(matC3, matPad, 0, yPad, 0, xPad, cv.BORDER_CONSTANT);

  const input = cv.blobFromImage(
    matPad,
    1 / 255.0,
    new cv.Size(MODEL_WIDTH, MODEL_HEIGTH),
    new cv.Scalar(0, 0, 0),
    true, // swap RB
    false,
  );

  mat.delete();
  matC3.delete();
  matPad.delete();

  // Kembalikan rasio skaling yang benar
  return [input, scale_x, scale_y];
};

export default preprocessing;
