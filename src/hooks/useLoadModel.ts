import { InferenceSession } from "onnxruntime-web";
import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import modelUrl from "../assets/yolo11n-nms.onnx?url";

const useLoadModel = (
  sessionRef: RefObject<InferenceSession | null>,
  onLoading: Dispatch<SetStateAction<boolean>>,
) => {
  useEffect(() => {
    const loadModel = async () => {
      if (sessionRef.current) return;

      try {
        onLoading(true);
        console.log("Load model from:", modelUrl);
        const nms = await InferenceSession.create(modelUrl);
        sessionRef.current = nms;
      } catch (e) {
        alert(e);
      } finally {
        onLoading(false);
      }
    };

    loadModel();
  }, [onLoading, sessionRef]);
};

export default useLoadModel;
