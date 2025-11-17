import { InferenceSession, Tensor } from "onnxruntime-web";
import type { RefObject } from "react";
import { INPUT_SHAPE, MODEL_HEIGTH, MODEL_WIDTH } from "./constants";
import createBoundingBoxes from "./createBoundingBoxes";
import prepareInput from "./prepareInput";
import renderBoxes from "./renderBoxes";

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

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const xScale = canvas.width / MODEL_WIDTH;
  const yScale = canvas.height / MODEL_HEIGTH;

  // 1. Pre-processing
  const inputAsArray = prepareInput(image);
  const tensor = new Tensor(
    "float32",
    new Float32Array(inputAsArray),
    INPUT_SHAPE,
  );

  // 2. Inference
  const modelInputName = session.inputNames[0];
  const modelOutputName = session.outputNames[0];

  const feeds: { [key: string]: Tensor } = {};
  feeds[modelInputName] = tensor;

  const results = await session.run(feeds);
  const outputTensor = results[modelOutputName]; // [1, num_detections, 6]

  // 3. Post-processing
  const boxes = createBoundingBoxes(
    outputTensor.data as Float32Array,
    outputTensor.dims[1],
    outputTensor.dims[2],
    xScale,
    yScale,
  );

  // 4. Render
  renderBoxes(ctx, boxes);
};

export default detectImage;
