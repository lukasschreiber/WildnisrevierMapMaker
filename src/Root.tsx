import { useMemo } from "react";
import { usePanels } from "./panels";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";

export function Root() {
    const panels = usePanels();

    const router = useMemo(
        () =>
            createBrowserRouter([
                {
                    path: "/",
                    element: <App />,
                    children: [
                        {
                            index: true,
                            element: null,
                        },
                        ...panels.flatMap((group) =>
                            group.panels.map((panel) => ({
                                path: panel.path,
                                element: <panel.component />,
                            })),
                        ),
                    ],
                },
            ]),
        [panels],
    );

    return <RouterProvider router={router} />;
}
