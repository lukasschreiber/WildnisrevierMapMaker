import "@maplibre/maplibre-gl-leaflet";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, Router, RouterProvider } from "react-router";
import { PathsPanel } from "./componentsV2/panels/PathsPanel.tsx";
import { WaypointsPanel } from "./componentsV2/panels/WaypointsPanel.tsx";

if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((persistent) => {
        if (persistent) {
            console.log("Storage will not be cleared except by explicit user action");
        } else {
            console.warn("Storage may be cleared by the UA under storage pressure.");
        }
    });
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "waypoints",
                element: <WaypointsPanel />,
            },
            {
                path: "paths",
                element: <PathsPanel />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
