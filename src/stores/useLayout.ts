import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

type LayoutStore = {
    menuOpen: boolean;
    showSidebar: boolean;
    setShowSidebar: (show: boolean) => void;
    mapView: {
        center: [number, number];
        zoom: number;
    },
    pinnedSidebarItems?: string[];
    pinSidebarItem?: (item: string) => void;
    unpinSidebarItem?: (item: string) => void;
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
            showSidebar: true,
            setShowSidebar: (show) => set({ showSidebar: show }),
            toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
            setShowMenu: (show) => set({ menuOpen: show }),
            setMapView: (center: [number, number], zoom: number) => set({
                mapView: { center, zoom }
            }),
            pinnedSidebarItems: [],
            pinSidebarItem: (item) => set((state) => ({
                pinnedSidebarItems: [...(state.pinnedSidebarItems || []), item]
            })),
            unpinSidebarItem: (item) => set((state) => ({
                pinnedSidebarItems: (state.pinnedSidebarItems || []).filter(i => i !== item)
            }))
        }),
        {
            name: getLocalStorageKey("layout"),
        }
    )
)