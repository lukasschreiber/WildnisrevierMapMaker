import "@maplibre/maplibre-gl-leaflet";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { PathsPanel } from "./componentsV2/panels/PathsPanel.tsx";
import { WaypointsPanel } from "./componentsV2/panels/WaypointsPanel.tsx";

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
