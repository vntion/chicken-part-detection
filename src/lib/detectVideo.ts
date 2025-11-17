import { InferenceSession, Tensor } from "onnxruntime-web";
import { INPUT_SHAPE, MODEL_HEIGTH, MODEL_WIDTH } from "./constants"; // Pastikan konstanta ini ada
import type { RefObject } from "react";
import type { Box } from "../types/Box";

// --- Daftar Kelas YOLO ---
const yolo_classes = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];

// --- FUNGSI GENERATOR WARNA UNTUK SETIAP KELAS ---
const generateColor = (classId: number): string => {
  const colors = [
    "#FF3838",
    "#FF9933",
    "#FFCC33",
    "#CCFF33",
    "#66FF33",
    "#33FF66",
    "#33FFCC",
    "#33CCFF",
    "#3366FF",
    "#6633FF",
    "#CC33FF",
    "#FF33CC",
  ];
  return colors[classId % colors.length];
};

// --- Logika Preprocessing untuk Video Frame ---
const prepare_input_video = (video: HTMLVideoElement): number[] => {
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_WIDTH;
  canvas.height = MODEL_HEIGTH;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Gagal mendapatkan konteks 2D kanvas sementara");
  }
  // Gambar frame video saat ini ke kanvas sementara (di-stretch)
  context.drawImage(video, 0, 0, MODEL_WIDTH, MODEL_HEIGTH);
  const data = context.getImageData(0, 0, MODEL_WIDTH, MODEL_HEIGTH).data;
  const red = [],
    green = [],
    blue = [];
  for (let index = 0; index < data.length; index += 4) {
    red.push(data[index] / 255);
    green.push(data[index + 1] / 255);
    blue.push(data[index + 2] / 255);
  }
  return [...red, ...green, ...blue];
};

/**
 * Fungsi helper untuk menggambar kotak dan hitungan (jika diaktifkan)
 */
const renderBoxesAndCount = (
  ctx: CanvasRenderingContext2D,
  boxes: Box[],
  isCounting: boolean,
) => {
  ctx.lineWidth = 3;
  ctx.font = "18px Arial";

  const counts: { [key: string]: number } = {};

  boxes.forEach((box) => {
    const [x, y, w, h] = box.bounding;
    const label = box.label;
    const prob = box.probability;
    const classId = box.classId;

    // Tambahkan ke hitungan
    if (isCounting) {
      counts[label] = (counts[label] || 0) + 1;
    }

    // Dapatkan warna berdasarkan classId
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

  // Gambar tabel hitungan jika 'isCounting' true
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

/**
 * Fungsi utama deteksi video
 */
const detectVideo = async (
  video: HTMLVideoElement,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  session: InferenceSession,
  isCounting: boolean,
): Promise<void> => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const xScale = canvas.width / MODEL_WIDTH;
  const yScale = canvas.height / MODEL_HEIGTH;
  const scoreThreshold = 0.25;

  const detectionLoop = async () => {
    if (video.paused || video.ended) {
      requestAnimationFrame(detectionLoop);
      return;
    }

    // 1. Preprocessing
    const inputAsArray = prepare_input_video(video);
    const tensor = new Tensor(
      "float32",
      new Float32Array(inputAsArray),
      INPUT_SHAPE,
    );

    // 2. Jalankan Model
    const feeds: { [key: string]: Tensor } = {};
    feeds[session.inputNames[0]] = tensor;

    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];

    // 3. Post-processing
    const boxes: Box[] = [];
    const outputData = outputTensor.data as Float32Array;
    const numDetections = outputTensor.dims[1];
    const propsPerDetection = outputTensor.dims[2];

    for (let i = 0; i < numDetections; i++) {
      const data = outputData.slice(
        i * propsPerDetection,
        (i + 1) * propsPerDetection,
      );
      const x_min = data[0];
      const y_min = data[1];
      const x_max = data[2];
      const y_max = data[3];
      const score = data[4];
      const class_id = Math.round(data[5]);

      if (score < scoreThreshold) continue;

      const x = x_min * xScale;
      const y = y_min * yScale;
      const w = (x_max - x_min) * xScale;
      const h = (y_max - y_min) * yScale;

      boxes.push({
        bounding: [x, y, w, h],
        label: yolo_classes[class_id],
        probability: score,
        classId: class_id,
      });
    }

    // 4. Render
    // PENTING: Bersihkan canvas agar transparan sebelum menggambar kotak baru
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // HAPUS baris ini: ctx.drawImage(video, ...);
    // Kita ingin melihat video player asli di belakang, bukan gambar di canvas.

    // Gambar kotak dan hitungan
    renderBoxesAndCount(ctx, boxes, isCounting);

    requestAnimationFrame(detectionLoop);
  };

  detectionLoop();
};

export default detectVideo;
