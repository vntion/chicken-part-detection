import { InferenceSession } from "onnxruntime-web";
import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { ModelType } from "../context/ModelContext";

type Props = {
  sessionRef: RefObject<InferenceSession | null>;
  model: ModelType;
  onChangeLoadedModel: (model: ModelType) => void;
  onLoading: Dispatch<SetStateAction<boolean>>;
};

const useLoadModel = ({
  sessionRef,
  model,
  onChangeLoadedModel,
  onLoading,
}: Props) => {
  useEffect(() => {
    const loadModel = async () => {
      try {
        onLoading(true);

        if (sessionRef.current) {
          sessionRef.current.release();
          sessionRef.current = null;
        }

        const fileName = `${model.toLowerCase()}.onnx`;
        const modelPath = `${import.meta.env.BASE_URL}${fileName}`;

        console.log(`[LoadModel] Mencoba memuat: ${modelPath}`);

        const response = await fetch(modelPath, { method: "HEAD" });

        if (!response.ok) {
          throw new Error(
            `File ${fileName} tidak ditemukan (404). Cek folder public/models dan nama filenya.`,
          );
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(`Something went wrong`);
        }

        const session = await InferenceSession.create(modelPath);
        sessionRef.current = session;

        onChangeLoadedModel(model);
        console.log(`[LoadModel] Success: ${model}`);
      } catch (e) {
        console.error(e);
        alert(`Failed to load ${model}: ${e instanceof Error ? e.message : e}`);
      } finally {
        onLoading(false);
      }
    };

    loadModel();
  }, [model]); // Dependency hanya model
};

export default useLoadModel;
