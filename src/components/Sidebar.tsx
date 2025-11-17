import { Image, Video } from "lucide-react";
import { useMode } from "../context/ModeContext";

function Sidebar() {
  const { onChangeMode, mode } = useMode();

  return (
    <aside className="flex w-64 flex-col bg-gray-900 p-6 text-white shadow-xl">
      <h1 className="mb-1 text-center text-3xl font-bold">
        Chicken part detection
      </h1>
      <h3 className="mb-8 text-center text-gray-400">powered by yolov11</h3>
      <nav className="mb-auto flex flex-col space-y-2">
        <button
          onClick={() => onChangeMode("image")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all hover:cursor-pointer ${
            mode === "image"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <Image />
          <span>Deteksi Gambar</span>
        </button>
        <button
          onClick={() => onChangeMode("video")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all hover:cursor-pointer ${
            mode === "video"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <Video />
          <span>Deteksi Video</span>
        </button>
      </nav>

      {/* <div className="text-center text-gray-400">Created by Baskoro</div> */}
    </aside>
  );
}

export default Sidebar;
