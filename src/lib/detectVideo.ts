import { InferenceSession, Tensor } from "onnxruntime-web";
import type { RefObject } from "react";
import { INPUT_SHAPE, MODEL_HEIGTH, MODEL_WIDTH } from "./constants"; // Pastikan konstanta ini ada
import createBoundingBoxes from "./createBoundingBoxes";
import prepareInput from "./prepareInput";
import renderBoxes from "./renderBoxes";

const detectVideo = async (
  video: HTMLVideoElement,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  session: InferenceSession,
  isCounting: boolean,
): Promise<void> => {
  const canvas = canvasRef.current;
  if (!canvas) {
    console.error("Elemen kanvas tidak ditemukan.");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const xScale = canvas.width / MODEL_WIDTH;
  const yScale = canvas.height / MODEL_HEIGTH;

  const detectionLoop = async () => {
    if (video.paused || video.ended) {
      requestAnimationFrame(detectionLoop);
      return;
    }

    // 1. Preprocessing
    const inputAsArray = prepareInput(video);
    const tensor = new Tensor(
      "float32",
      new Float32Array(inputAsArray),
      INPUT_SHAPE,
    );

    // 2. Run Model
    const modelInputName = session.inputNames[0];
    const modelOutputName = session.outputNames[0];

    const feeds: { [key: string]: Tensor } = {};
    feeds[modelInputName] = tensor;

    const results = await session.run(feeds);
    const outputTensor = results[modelOutputName];

    // 3. Post-processing
    const boxes = createBoundingBoxes(
      outputTensor.data as Float32Array,
      outputTensor.dims[1],
      outputTensor.dims[2],
      xScale,
      yScale,
    );

    // 4. Render
    // PENTING: Bersihkan canvas agar transparan sebelum menggambar kotak baru
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // HAPUS baris ini: ctx.drawImage(video, ...);
    // Kita ingin melihat video player asli di belakang, bukan gambar di canvas.

    // Gambar kotak dan hitungan
    renderBoxes(ctx, boxes, isCounting);

    requestAnimationFrame(detectionLoop);
  };

  detectionLoop();
};

export default detectVideo;
