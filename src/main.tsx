import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  void navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`)
    .catch(() => {
      // The online app still works when service workers are unavailable.
    });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
