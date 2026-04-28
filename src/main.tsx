import "@maplibre/maplibre-gl-leaflet";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { panels } from "./panels.tsx";
import { SingleWaypointPanelWrapper } from "./componentsV2/panels/SingleWaypointPanel.tsx";
import { SingleWaypointTypePanelWrapper } from "./componentsV2/panels/SingleWaypointTypePanel.tsx";
import { SinglePathPanelWrapper } from "./componentsV2/panels/SinglePathPanel.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            ...panels.flatMap((group) =>
                group.panels.map((panel) => ({
                    path: panel.path,
                    element: <panel.component />,
                }))
            ),
            {
                path: "/waypoint/:id",
                element: <SingleWaypointPanelWrapper />,
            },
            {
                path: "/type/:id",
                element: <SingleWaypointTypePanelWrapper />,
            },
            {
                path: "/path/:id",
                element: <SinglePathPanelWrapper />,
            }
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
