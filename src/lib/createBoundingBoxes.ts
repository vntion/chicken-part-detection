import type { Box } from "../types/Box";
import { LABELS, SCORE_THRESHOLD } from "./constants";

const createBoundingBoxes = (
  outputData: Float32Array,
  numDetections: number, // Jumlah deteksi yang ditemukan
  propsPerDetection: number, // Seharusnya 6 atau 7
  xScale: number,
  yScale: number,
) => {
  const boxes: Box[] = [];

  for (let i = 0; i < numDetections; i++) {
    const data = outputData.slice(
      i * propsPerDetection,
      (i + 1) * propsPerDetection,
    );

    const x_min_640 = data[0];
    const y_min_640 = data[1];
    const x_max_640 = data[2];
    const y_max_640 = data[3];
    const score = data[4];
    const class_id = Math.round(data[5]);

    if (score < SCORE_THRESHOLD) continue;

    // Skalakan kembali ke ukuran gambar asli
    const x = x_min_640 * xScale;
    const y = y_min_640 * yScale;
    const w = (x_max_640 - x_min_640) * xScale;
    const h = (y_max_640 - y_min_640) * yScale;

    boxes.push({
      bounding: [x, y, w, h],
      label: LABELS[Math.round(class_id)],
      probability: score,
      classId: class_id,
    });
  }

  return boxes;
};

export default createBoundingBoxes;
