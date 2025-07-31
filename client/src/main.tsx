import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeTheme } from "@/utils/settings-storage";

// Initialize theme on app start
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
