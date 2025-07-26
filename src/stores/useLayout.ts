import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

type LayoutStore = {
    showSidebar: boolean;
    mapView: {
        center: [number, number];
        zoom: number;
    }
    toggleSidebar: () => void;
    setShowSidebar: (show: boolean) => void;
    setMapView: (center: [number, number], zoom: number) => void;
}

export const useLayoutStore = create<LayoutStore>()(
    persist(
        (set) => ({
            showSidebar: true,
            mapView: {
                center: [52.52, 13.405], // Default center (Berlin)
                zoom: 13, // Default zoom level
            },

            toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
            setShowSidebar: (show: boolean) => set({ showSidebar: show }),
            setMapView: (center: [number, number], zoom: number) => set({
                mapView: { center, zoom }
            }),
        }),
        {
            name: getLocalStorageKey("layout"),
        }
    )
)