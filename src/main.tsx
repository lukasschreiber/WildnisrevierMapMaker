import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WaypointProvider } from "./context/WaypointContext.tsx";
import { SettingsProvider } from "./settings/SettingsContext.tsx";
import { WaypointTypeProvider } from "./context/WaypointTypeContext.tsx";
import { PathProvider } from "./context/PathContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SettingsProvider>
            <WaypointProvider>
                <PathProvider>
                    <WaypointTypeProvider>
                        <App />
                    </WaypointTypeProvider>
                </PathProvider>
            </WaypointProvider>
        </SettingsProvider>
    </StrictMode>
);
