import { InferenceSession, Tensor } from "onnxruntime-web";
import { INPUT_SHAPE, MODEL_HEIGTH, MODEL_WIDTH } from "./constants"; // Pastikan konstanta ini (misal: 640) ada
import type { RefObject } from "react";

// --- Daftar Kelas YOLO (masih diperlukan untuk render label) ---
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

// --- Logika Preprocessing (dari blog dev.to, masih diperlukan) ---
/**
 * Menyiapkan input gambar (manual, tanpa OpenCV)
 * @param img Elemen gambar sumber
 * @returns Array flat [R..., G..., B...] yang dinormalisasi
 */
const prepare_input = (img: HTMLImageElement): number[] => {
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_WIDTH;
  canvas.height = MODEL_HEIGTH;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Gagal mendapatkan konteks 2D kanvas");
  }
  // Resize/stretch gambar ke 640x640
  context.drawImage(img, 0, 0, MODEL_WIDTH, MODEL_HEIGTH);
  const data = context.getImageData(0, 0, MODEL_WIDTH, MODEL_HEIGTH).data;
  const red = [],
    green = [],
    blue = [];
  // Memisahkan channel R, G, B dan normalisasi (format CHW)
  for (let index = 0; index < data.length; index += 4) {
    red.push(data[index] / 255);
    green.push(data[index + 1] / 255);
    blue.push(data[index + 2] / 255);
  }
  return [...red, ...green, ...blue];
};

// --- Logika NMS MANUAL (process_output, iou, dll) DIHAPUS ---
// ... TIDAK PERLU ...
// ... TIDAK PERLU ...

/**
 * Fungsi helper untuk menggambar
 */
const renderBoxes = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  boxes: {
    bounding: [number, number, number, number];
    label: string;
    probability: number;
  }[],
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#4ade80"; // Hijau cerah
  ctx.lineWidth = 3;
  ctx.font = "18px Arial";

  boxes.forEach((box) => {
    const [x, y, w, h] = box.bounding;
    const label = box.label;
    const prob = box.probability;

    // Gambar kotak [x, y, w, h]
    ctx.strokeRect(x, y, w, h);

    // Gambar label
    ctx.fillStyle = "#4ade80";
    const text = `${label} (${(prob * 100).toFixed(1)}%)`;
    const width = ctx.measureText(text).width;
    ctx.fillRect(x, y, width + 10, 25); // Latar belakang teks
    ctx.fillStyle = "#000000"; // Teks hitam
    ctx.fillText(text, x + 5, y + 18);
  });
};

/**
 * Fungsi utama deteksi (UNTUK MODEL ONNX DENGAN NMS)
 */
const detectImage = async (
  image: HTMLImageElement,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  session: InferenceSession,
): Promise<void> => {
  const canvas = canvasRef.current;
  if (!canvas) {
    console.error("Elemen kanvas tidak ditemukan.");
    return;
  }

  // 1. Preprocessing (Masih diperlukan)
  const inputAsArray = prepare_input(image);
  const tensor = new Tensor(
    "float32",
    new Float32Array(inputAsArray),
    INPUT_SHAPE,
  );

  // 2. Jalankan Model (Gunakan 'session.nms' untuk model "pintar" Anda)
  const modelInputName = session.inputNames[0];
  const modelOutputName = session.outputNames[0]; // Output yang sudah di-NMS

  const feeds: { [key: string]: Tensor } = {};
  feeds[modelInputName] = tensor;

  const results = await session.run(feeds);
  const outputTensor = results[modelOutputName]; // Ini adalah [1, num_detections, 6]

  // 3. Post-processing (JAUH LEBIH SEDERHANA)
  const boxes = [];
  const outputData = outputTensor.data;
  const numDetections = outputTensor.dims[1]; // Jumlah deteksi yang ditemukan
  const propsPerDetection = outputTensor.dims[2]; // (Harusnya 6 atau 7)

  // Hitung rasio skaling (karena 'prepare_input' melakukan STRETCHING)
  const xScale = image.naturalWidth / MODEL_WIDTH;
  const yScale = image.naturalHeight / MODEL_HEIGTH;

  for (let i = 0; i < numDetections; i++) {
    const data = outputData.slice(
      i * propsPerDetection,
      (i + 1) * propsPerDetection,
    );

    // Format output [x_min, y_min, x_max, y_max, score, class_id]
    // (Jika output Anda [batch_id, x_min, ...], sesuaikan indeksnya)
    const x_min_640 = data[0]; // atau data[1] jika ada batch_id
    const y_min_640 = data[1]; // atau data[2]
    const x_max_640 = data[2]; // atau data[3]
    const y_max_640 = data[3]; // atau data[4]
    const score = data[4]; // atau data[5]
    const class_id = data[5]; // atau data[6]

    // --- PERBAIKAN DIMULAI ---
    // Tambahkan ambang batas (threshold) untuk memfilter
    // deteksi palsu/"hantu" yang memiliki skor sangat rendah.
    // Anda bisa sesuaikan nilai 0.25 ini (misal: 0.3 atau 0.5)
    if (Number(score) < 0.25) {
      continue; // Lewati deteksi ini
    }
    // --- PERBAIKAN SELESAI ---

    // Skalakan kembali ke ukuran gambar asli
    const x = x_min_640 * xScale;
    const y = y_min_640 * yScale;
    const w = (x_max_640 - x_min_640) * xScale;
    const h = (y_max_640 - y_min_640) * yScale;

    boxes.push({
      bounding: [x, y, w, h],
      label: yolo_classes[Math.round(class_id)],
      probability: score,
    });
  }
  // --- AKHIR POST-PROCESSING ---

  // 4. Render Hasil
  renderBoxes(canvas, image, boxes);
};

export default detectImage;
