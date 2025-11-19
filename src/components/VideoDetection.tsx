import { UploadCloud } from "lucide-react";
import type { InferenceSession } from "onnxruntime-web";
import { useRef, useState } from "react";
import type Player from "video.js/dist/types/player";
import useInitVideo from "../hooks/useInitVideo";
import detectVideo from "../lib/detectVideo";

type Props = {
  session: InferenceSession | null;
};

function VideoDetection({ session }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [enableCounting, setEnableCounting] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  const videoNode = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);
  const videoURLRef = useRef<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsReadyToPlay(false);
    }
  };

  const handleSubmit = () => {
    if (!playerRef.current || !canvasRef.current || !session) {
      alert("Komponen belum siap.");
      return;
    }

    const player = playerRef.current;
    const canvas = canvasRef.current;

    const videoElement = player.tech().el() as HTMLVideoElement;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    player.play();

    detectVideo(videoElement, canvasRef, session, enableCounting);
  };

  // Inisialisasi Video.js saat file siap
  useInitVideo({
    file,
    videoNode,
    videoURLRef,
    playerRef,
    onReadyToPlay: setIsReadyToPlay,
  });

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800">Deteksi Video</h2>

      <p className="text-gray-600">
        Unggah video untuk deteksi standar, atau aktifkan counting opsional.
      </p>

      <form>
        {file ? (
          <>
            <div className="relative mx-auto w-full overflow-hidden rounded-lg bg-black shadow-lg">
              <div data-vjs-player key={file.name}>
                <video
                  ref={videoNode}
                  className="video-js vjs-big-play-centered"
                />
              </div>

              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute top-0 left-0 z-10 max-h-full w-full object-contain"
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div>
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
                  accept="video/mp4, video/avi, video/quicktime, .mov"
                />
                Ganti video
              </label>
            </div>
          </>
        ) : (
          <>
            <label
              className="relative block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-colors hover:border-green-500"
              htmlFor="input_file"
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                accept="video/mp4, video/avi, video/quicktime, .mov"
                id="input_file"
              />

              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />

              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Seret & Lepas file video
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                MP4, AVI, MOV hingga 50MB
              </p>
            </label>
          </>
        )}

        <h3 className="mb-2 pt-4 text-xl font-semibold text-gray-700">
          Counting
        </h3>
        {/* Opsi Checkbox */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <label
            htmlFor="counting-checkbox-v1"
            className="flex cursor-pointer items-center"
          >
            <input
              id="counting-checkbox-v1"
              type="checkbox"
              checked={enableCounting}
              onChange={(e) => setEnableCounting(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />

            <div className="ml-3">
              <span className="font-bold text-gray-800">Object Counting</span>

              <p className="text-sm text-gray-500">Menghitung jumlah objek.</p>
            </div>
          </label>
        </div>
        {/* Tombol Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!file || !isReadyToPlay}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isReadyToPlay ? "Mulai deteksi video" : "Memuat Player..."}
        </button>
      </form>
    </>
  );
}

export default VideoDetection;
