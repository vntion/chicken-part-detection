import { Image, Video, Box } from "lucide-react";
import { useMode } from "../context/ModeContext";
import { type ModelType, useModel } from "../context/ModelContext";

function Sidebar() {
  const { model, loadedModel, onChangeModel } = useModel();
  const { onChangeMode, mode } = useMode();

  const modelOptions: ModelType[] = ["Yolo11n", "Yolo11s", "Yolo11m"];

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

        <div className="mt-6 border-t border-gray-700 pt-6">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-400">
            <Box size={16} />
            Pilih Model
          </span>
          <select
            value={model}
            onChange={(e) => onChangeModel(e.target.value as ModelType)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {modelOptions.map((option) => {
              const isLoaded = loadedModel.includes(option);

              return (
                <option
                  key={option}
                  value={option}
                  className={
                    isLoaded
                      ? "bg-gray-800 font-bold text-green-400"
                      : "bg-gray-800 text-amber-500"
                  }
                >
                  {option} {isLoaded ? "●" : "○"}
                </option>
              );
            })}
          </select>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
