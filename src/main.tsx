import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WaypointProvider } from "./context/WaypointContext.tsx";
import { SettingsProvider } from "./settings/SettingsContext.tsx";
import { WaypointTypeProvider } from "./context/WaypointTypeContext.tsx";
import { PathProvider } from "./context/PathContext.tsx";
import { WaypointGroupProvider } from "./context/WaypointGroupContext.tsx";
import { ShapeProvider } from "./context/ShapeContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SettingsProvider>
            <PathProvider>
                <ShapeProvider>
                    <WaypointProvider>
                        <WaypointGroupProvider>
                            <WaypointTypeProvider>
                                <App />
                            </WaypointTypeProvider>
                        </WaypointGroupProvider>
                    </WaypointProvider>
                </ShapeProvider>
            </PathProvider>
        </SettingsProvider>
    </StrictMode>
);
