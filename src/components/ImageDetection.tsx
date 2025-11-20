import { Loader2, ScanSearch, UploadCloud, Wand2 } from "lucide-react";
import type { InferenceSession } from "onnxruntime-web";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import detectImage from "../lib/detectImage";
import generateEnhancedImages from "../lib/generateEnhancedImages";
import type { EnhancedImageResult } from "../types/EnhancedImageResult";

type Props = {
  session: InferenceSession | null;
};

function ImageDetection({ session }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDetected, setIsDetected] = useState(false);
  const [imageOption, setImageOption] = useState<"enhance" | "region" | null>(
    null,
  );
  const [enhancedResults, setEnhancedResults] = useState<EnhancedImageResult[]>(
    [],
  );

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsDetected(false);
      setEnhancedResults([]);
      canvasRefs.current = [];
    }
  };

  const imageURL = file ? URL.createObjectURL(file) : "";

  const handleSubmit = async () => {
    if (!file) {
      alert("Silakan unggah gambar terlebih dahulu.");
      return;
    }
    if (!session) {
      alert("Model belum dimuat");
      return;
    }
    if (!imageOption) {
      alert("Pilih opsi terlebih dahulu (Enhancement atau Region).");
      return;
    }

    setIsLoading(true);
    setIsDetected(false);
    setEnhancedResults([]);

    try {
      const image = new Image();
      image.src = imageURL;

      image.onload = async () => {
        if (imageOption === "region") {
          await detectImage(image, canvasRefs.current[0], session);
          setIsDetected(true);
        } else if (imageOption === "enhance") {
          const results = await generateEnhancedImages(image);
          setEnhancedResults(results);
        }
      };
    } catch (e) {
      alert(`Error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const runMultiDetection = async () => {
      if (imageOption === "enhance" && enhancedResults.length > 0 && session) {
        try {
          for (let i = 0; i < enhancedResults.length; i++) {
            const item = enhancedResults[i];
            const canvasEl = canvasRefs.current[i];

            if (canvasEl) {
              const img = new Image();
              img.src = item.url;
              await new Promise((resolve) => {
                img.onload = async () => {
                  await detectImage(img, canvasEl, session);
                  resolve(true);
                };
              });
            }
          }
          setIsDetected(true);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    runMultiDetection();
  }, [enhancedResults, session, imageOption]);

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800">Deteksi Gambar</h2>
      <p className="text-gray-600">
        Unggah gambar untuk ditingkatkan (enhance) atau deteksi wilayah objek
        (region).
      </p>

      <form>
        {file ? (
          <div className="mt-4">
            {!isDetected && enhancedResults.length === 0 && (
              <img
                src={imageURL}
                alt={file.name}
                className="mx-auto h-auto max-h-[300px] w-full object-contain"
              />
            )}

            {imageOption === "region" && (
              <canvas
                ref={(el) => {
                  canvasRefs.current[0] = el;
                }}
                className={
                  isDetected
                    ? "mx-auto block h-auto max-h-[400px] w-full object-contain"
                    : "hidden"
                }
              />
            )}

            {imageOption === "enhance" && enhancedResults.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {enhancedResults.map((item, index) => (
                  <div key={index} className="rounded border bg-gray-50 p-2">
                    <p className="mb-1 text-center text-sm font-semibold">
                      {item.type}
                    </p>
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[index] = el;
                      }}
                      className="block h-auto w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <h3 className="text-sm font-medium text-gray-900">
                File: {file.name}
              </h3>
              <p className="text-xs text-gray-500">
                Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <label
                htmlFor="input_file"
                className="mt-2 inline-block cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="input_file"
                  accept="image/png, image/jpeg, image/webp"
                />
                Ganti Gambar
              </label>
            </div>
          </div>
        ) : (
          <label
            className="relative mt-6 block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center hover:border-blue-500"
            htmlFor="input_file"
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              id="input_file"
              accept="image/png, image/jpeg, image/webp"
            />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Seret & Lepas atau Klik
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, WEBP hingga 10MB
            </p>
          </label>
        )}

        <h3 className="mb-2 pt-6 text-xl font-semibold text-gray-700">
          Opsi Pemrosesan
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start rounded-lg border p-4 transition-all ${
              imageOption === "enhance"
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white"
            }`}
          >
            <Wand2 className="mt-1 mr-3 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <span className="font-bold text-gray-800">Image Enhancement</span>
              <p className="text-sm text-gray-500">
                Tampilkan 4 variasi gambar + deteksi.
              </p>
            </div>
            <input
              type="radio"
              name="image_option"
              value="enhance"
              className="sr-only"
              checked={imageOption === "enhance"}
              onChange={() => {
                setImageOption("enhance");
                setIsDetected(false);
                setEnhancedResults([]);
              }}
            />
          </label>

          <label
            className={`flex cursor-pointer items-start rounded-lg border p-4 transition-all ${
              imageOption === "region"
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white"
            }`}
          >
            <ScanSearch className="mt-1 mr-3 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <span className="font-bold text-gray-800">Object Region</span>
              <p className="text-sm text-gray-500">
                Deteksi langsung (Single View).
              </p>
            </div>
            <input
              type="radio"
              name="image_option"
              value="region"
              className="sr-only"
              checked={imageOption === "region"}
              onChange={() => {
                setImageOption("region");
                setIsDetected(false);
                setEnhancedResults([]);
              }}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !file || !imageOption}
          className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Mulai Deteksi</span>
          )}
        </button>
      </form>
    </>
  );
}

export default ImageDetection;
