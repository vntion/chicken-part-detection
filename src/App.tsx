import { useEffect, useRef, useState } from "react";
import Container from "./components/Container";
import ImageDetection from "./components/ImageDetection";
import Main from "./components/Main";
import Sidebar from "./components/Sidebar";
import VideoDetection from "./components/VideoDetection";
import { useMode } from "./context/ModeContext";
import { InferenceSession, env } from "onnxruntime-web";
import LoadingModal from "./components/LoadingModal";
import modelUrl from "./assets/yolo11n-nms.onnx?url";

env.wasm.wasmPaths = import.meta.env.BASE_URL;

function App() {
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const sessionRef = useRef<InferenceSession>(null);
  const { mode } = useMode();

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoadingModel(true);
        console.log("Mencoba load model dari:", modelUrl);
        const nms = await InferenceSession.create(modelUrl);
        sessionRef.current = nms;
      } catch (e) {
        alert(e);
      } finally {
        setIsLoadingModel(false);
      }
    };

    loadModel();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Main>
        {isLoadingModel && <LoadingModal />}
        {mode === "image" && <ImageDetection session={sessionRef.current} />}
        {mode === "video" && <VideoDetection session={sessionRef.current} />}
      </Main>
    </Container>
  );
}

export default App;
