import "@maplibre/maplibre-gl-leaflet";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { panels } from "./panels.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [...panels.flatMap((group) => group.panels.map((panel) => ({
            path: panel.path,
            element: <panel.component />,
        })))],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
