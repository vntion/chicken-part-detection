import { InferenceSession, env } from "onnxruntime-web";
import { useRef, useState } from "react";
import Container from "./components/Container";
import ImageDetection from "./components/ImageDetection";
import LoadingModal from "./components/LoadingModal";
import Main from "./components/Main";
import Sidebar from "./components/Sidebar";
import VideoDetection from "./components/VideoDetection";
import { useMode } from "./context/ModeContext";
import useLoadModel from "./hooks/useLoadModel";
import { useMediaQuery } from "react-responsive";

env.wasm.wasmPaths = import.meta.env.BASE_URL;

function App() {
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const sessionRef = useRef<InferenceSession>(null);
  const { mode } = useMode();

  const isMobile = useMediaQuery({ query: "(max-width: 650px)" });
  const isLaptop = useMediaQuery({ query: "(min-width: 651px)" });

  useLoadModel(sessionRef, setIsLoadingModel);

  return (
    <>
      {isMobile && <p>Mobile device not supported</p>}

      {isLaptop && (
        <Container>
          <Sidebar />
          {isLoadingModel && <LoadingModal />}
          <Main>
            {mode === "image" && (
              <ImageDetection session={sessionRef.current} />
            )}
            {mode === "video" && (
              <VideoDetection session={sessionRef.current} />
            )}
          </Main>
        </Container>
      )}
    </>
  );
}

export default App;
