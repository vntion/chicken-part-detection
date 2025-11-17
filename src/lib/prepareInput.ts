import { MODEL_HEIGTH, MODEL_WIDTH } from "./constants";

const prepareInput = (input: HTMLVideoElement | HTMLImageElement): number[] => {
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_WIDTH;
  canvas.height = MODEL_HEIGTH;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Gagal mendapatkan konteks 2D kanvas sementara");
  }

  context.drawImage(input, 0, 0, MODEL_WIDTH, MODEL_HEIGTH);
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

export default prepareInput;
