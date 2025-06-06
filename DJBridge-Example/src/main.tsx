import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DJBridge } from "./lib/DJBridge.ts";
import { DJToPlatform } from "./lib/DJToPlatform.ts";
import { PlatformToDJ } from "./lib/PlatformToDJ.ts";

DJBridge.initReceptor(PlatformToDJ);
DJToPlatform.loadFrameworkEnd();
DJToPlatform.startLoad();
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
