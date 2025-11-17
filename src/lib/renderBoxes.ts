import type { Box } from "../types/Box";
import generateColor from "./generateColor";

const renderBoxes = (
  ctx: CanvasRenderingContext2D,
  boxes: Box[],
  isCounting: boolean = false,
) => {
  ctx.lineWidth = 3;
  ctx.font = "18px Arial";

  const counts: { [key: string]: number } = {};

  boxes.forEach((box) => {
    const [x, y, w, h] = box.bounding;
    const label = box.label;
    const prob = box.probability;
    const classId = box.classId;

    if (isCounting) {
      counts[label] = (counts[label] || 0) + 1;
    }

    const boxColor = generateColor(classId);

    // Gambar kotak
    ctx.strokeStyle = boxColor;
    ctx.strokeRect(x, y, w, h);

    // Gambar label
    ctx.fillStyle = boxColor;
    const text = `${label} (${(prob * 100).toFixed(1)}%)`;
    const width = ctx.measureText(text).width;
    ctx.fillRect(x, y, width + 10, 25); // Latar belakang teks
    ctx.fillStyle = "#000000"; // Teks hitam
    ctx.fillText(text, x + 5, y + 18);
  });

  if (isCounting) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Latar belakang semi-transparan

    const countEntries = Object.entries(counts);
    const boxHeight = countEntries.length * 28 + 15;
    ctx.fillRect(10, 10, 200, boxHeight); // Kotak latar belakang

    ctx.fillStyle = "#FFFFFF"; // Teks putih
    let y_offset = 35;

    countEntries.forEach(([label, count]) => {
      ctx.fillText(`${label}: ${count}`, 20, y_offset);
      y_offset += 28;
    });
  }
};

export default renderBoxes;
