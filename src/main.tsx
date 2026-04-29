import "@maplibre/maplibre-gl-leaflet";
import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { usePanels } from "./panels.tsx";
import { SingleWaypointPanelWrapper } from "./components/panels/SingleWaypointPanel.tsx";
import { SingleWaypointTypePanelWrapper } from "./components/panels/SingleWaypointTypePanel.tsx";
import { SinglePathPanelWrapper } from "./components/panels/SinglePathPanel.tsx";

function Root() {
    const panels = usePanels();

    const router = useMemo(
        () =>
            createBrowserRouter([
                {
                    path: "/",
                    element: <App />,
                    children: [
                        ...panels.flatMap((group) =>
                            group.panels.map((panel) => ({
                                path: panel.path,
                                element: <panel.component />,
                            })),
                        ),
                        {
                            path: "/waypoints/:id",
                            element: <SingleWaypointPanelWrapper />,
                        },
                        {
                            path: "/types/:id",
                            element: <SingleWaypointTypePanelWrapper />,
                        },
                        {
                            path: "/paths/:id",
                            element: <SinglePathPanelWrapper />,
                        },
                    ],
                },
            ]),
        [panels],
    );

    return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Root />
    </StrictMode>,
);
