import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initLiff } from "./lib/liff";

// LIFF初期化後にアプリをレンダリング
initLiff().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
