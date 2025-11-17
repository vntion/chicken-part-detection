import { Loader2 } from "lucide-react";

function LoadingModal() {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all">
      <div className="flex w-64 flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        {/* Icon Spinner */}
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />

        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Loading Model...
          </h3>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;
