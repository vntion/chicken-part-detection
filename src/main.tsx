import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { ModeProvider } from "./context/ModeContext.tsx";
import "video.js/dist/video-js.css";
import { ModelProvider } from "./context/ModelContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModelProvider>
      <ModeProvider>
        <App />
      </ModeProvider>
    </ModelProvider>
  </StrictMode>,
);
