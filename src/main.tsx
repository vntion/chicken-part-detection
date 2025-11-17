import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { ModeProvider } from "./context/ModeContext.tsx";
import "video.js/dist/video-js.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModeProvider>
      <App />
    </ModeProvider>
  </StrictMode>,
);
