import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

type LayoutStore = {
    menuOpen: boolean;
    mapView: {
        center: [number, number];
        zoom: number;
    }
    toggleMenu: () => void;
    setShowMenu: (show: boolean) => void;
    setMapView: (center: [number, number], zoom: number) => void;
}

export const useLayoutStore = create<LayoutStore>()(
    persist(
        (set) => ({
            mapView: {
                center: [52.52, 13.405], // Default center (Berlin)
                zoom: 13, // Default zoom level
            },
            menuOpen: false,
            toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
            setShowMenu: (show) => set({ menuOpen: show }),
            setMapView: (center: [number, number], zoom: number) => set({
                mapView: { center, zoom }
            }),
        }),
        {
            name: getLocalStorageKey("layout"),
        }
    )
)