import { Loader2, UploadCloud } from "lucide-react";
import type { InferenceSession } from "onnxruntime-web";
import { useRef, useState, type ChangeEvent } from "react";
import detectImage from "../lib/detectImage";
// import Result from "./Result"; // Tidak digunakan di sini, bisa dihapus jika mau

type Props = {
  session: InferenceSession | null;
};

function ImageDetection({ session }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDetected, setIsDetected] = useState(false);

  const canvasImage = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);

      setIsDetected(false);
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

    // Mulai loading
    setIsLoading(true); // DITAMBAHKAN KEMBALI
    // Pastikan kanvas tersembunyi & gambar asli terlihat
    setIsDetected(false); // DITAMBAHKAN KEMBALI

    const image = new Image();
    image.src = imageURL;

    image.onload = async () => {
      try {
        // Panggil fungsi detectImage yang sudah diperbarui dengan parameter
        await detectImage(
          image,
          canvasImage, // Hapus 'as RefObject<...>'
          session,
        );

        // Jika berhasil, set state untuk menampilkan kanvas
        setIsDetected(true); // DITAMBAHKAN KEMBALI
        console.log("Deteksi selesai, kanvas digambar."); // Diubah dari console.log(image)
      } catch (e) {
        alert(`Terjadi kesalahan saat deteksi: ${e}`);
      } finally {
        setIsLoading(false);
      }
    };
  };

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800">Deteksi Gambar</h2>
      <p className="text-gray-600">
        Unggah gambar untuk ditingkatkan (enhance) atau deteksi wilayah objek
        (region).
      </p>

      <form>
        {file ? (
          <div className="">
            {!isDetected && (
              <img
                src={imageURL}
                alt={file.name}
                className="h-auto max-h-210 w-full object-contain"
              />
            )}
            <canvas
              ref={canvasImage}
              className={
                isDetected
                  ? "block h-auto max-h-200 w-full object-contain"
                  : "hidden"
              }
            />

            <h3 className="mt-2 text-sm font-medium text-gray-900">
              File terpilih: {file.name}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <label
              htmlFor="input_file"
              className="mt-4 inline-block w-full cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="input_file"
                accept="image/png, image/jpeg, image/webp"
              />
              Ganti gambar
            </label>
          </div>
        ) : (
          <label
            className="relative block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-colors hover:border-blue-500"
            htmlFor="input_file"
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              id="input_file"
              accept="image/png, image/jpeg, image/webp"
            />
            <>
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Seret & Lepas atau Klik untuk mengunggah
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WEBP hingga 10MB
              </p>
            </>
          </label>
        )}

        {/* Tombol Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !file}
          className={
            "mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Mendeteksi...</span>
            </>
          ) : (
            <span>Mulai Deteksi Gambar</span>
          )}
        </button>
      </form>
    </>
  );
}

export default ImageDetection;
