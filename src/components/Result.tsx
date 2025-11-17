import { useEffect, useRef } from "react";

// Definisikan tipe untuk Box agar konsisten
type Box = {
  label: number;
  probability: number;
  bounding: number[];
};

type Props = {
  imageURL: string;
  boxes: Box[];
  onDetectAgain: () => void;
};

// Dapatkan nama label dari indeks (ini hanya contoh, sesuaikan dengan model Anda)
const LABELS = [
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

// Buat palet warna untuk label yang berbeda
const COLORS = [
  "#FF3838",
  "#FF9D97",
  "#FF701F",
  "#FFB21D",
  "#CFD231",
  "#48F90A",
  "#92CC17",
  "#3DDB86",
  "#1A9334",
  "#00D4BB",
  "#2C99A8",
  "#00C2FF",
  "#344593",
  "#6473FF",
  "#0018EC",
  "#8438FF",
  "#520085",
  "#CB38FF",
  "#FF95C8",
  "#FF37C7",
];

function Result({ imageURL, boxes, onDetectAgain }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = imageURL;

    image.onload = () => {
      // Sesuaikan ukuran canvas dengan gambar
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Gambar gambar asli
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Atur gaya untuk kotak dan teks
      ctx.lineWidth = 3;
      ctx.font = "18px 'Inter', sans-serif";
      ctx.textBaseline = "top";

      // Gambar setiap kotak
      boxes.forEach((box) => {
        const [x, y, w, h] = box.bounding;
        const label = LABELS[box.label] || `Label ${box.label}`;
        const score = (box.probability * 100).toFixed(1);
        const color = COLORS[box.label % COLORS.length];

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Gambar kotak
        ctx.strokeRect(x, y, w, h);

        // Gambar latar belakang teks
        const text = `${label}: ${score}%`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = parseInt(ctx.font, 10); // Perkiraan tinggi font

        const textX = x;
        const textY = y > textHeight + 5 ? y - (textHeight + 4) : y + 2; // Posisikan teks di atas kotak, atau di dalam jika dekat tepi atas

        ctx.fillRect(textX - 1, textY - 1, textWidth + 4, textHeight + 4);

        // Gambar teks
        ctx.fillStyle = "#FFFFFF"; // Teks putih
        ctx.fillText(text, textX + 1, textY + 1);
      });
    };
  }, [imageURL, boxes]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-center">
      <h2 className="text-4xl font-bold text-gray-800">Hasil Deteksi</h2>
      <p className="text-gray-600">
        Berikut adalah objek yang terdeteksi pada gambar Anda.
      </p>
      <div className="relative w-full overflow-hidden rounded-lg border-2 border-gray-300 bg-white">
        {/* Canvas akan diskalakan agar sesuai dengan container sambil menjaga rasio aspek */}
        <canvas ref={canvasRef} className="h-auto w-full object-contain" />
      </div>

      <button
        type="button"
        onClick={onDetectAgain}
        className={
          "mt-4 inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        Deteksi Gambar Lain
      </button>
    </div>
  );
}

export default Result;
