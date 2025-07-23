import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";
import { useWaypointStore } from "./useWaypoints";

export type WaypointType = {
    id: number;
    name: string;
    icon: "circle" | "square" | "triangle" | "star" | "cross" | "diamond" | "apple" | "cherry" | "treestump" | "camera";
    color: string;
    hasTwoColors: boolean;
    radiusOverride?: number;
    color2?: string;
    hidden: boolean;
    rotation?: number;
    additionalText?: {
        color?: string;
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string;
    }
};

interface WaypointTypeState {
    types: Record<number, WaypointType>;
    addType: (type: WaypointType) => void;
    updateType: (id: number, partial: Partial<WaypointType>) => void;
    removeType: (id: number) => void;
    getTypeById: (id: number) => WaypointType | undefined;
    isDeletable: (id: number) => boolean;
    setTypes: (types: Record<number, WaypointType>) => void;
}

export const useWaypointTypeStore = create<WaypointTypeState>()(
    persist(
        (set, get) => ({
            types: {
                1: { id: 1, name: "Default", icon: "circle", color: "#FF0000", hidden: false, hasTwoColors: false },
                2: { id: 2, name: "Custom", icon: "square", color: "#00FF00", hidden: false, hasTwoColors: false },
            },
            addType: (type) => set((state) => ({ types: { ...state.types, [type.id]: type } })),
            updateType: (id, partial) =>
                set((state) => ({
                    types: {
                        ...state.types,
                        [id]: { ...state.types[id], ...partial },
                    },
                })),
            removeType: (id) =>
                set((state) => {
                    const updated = { ...state.types };
                    delete updated[id];
                    return { types: updated };
                }),
            getTypeById: (id: number) => get().types[id],
            isDeletable: (id: number) => {
                const waypoints = useWaypointStore.getState().waypoints;
                return !waypoints.some((waypoint) => waypoint.typeId === id)
            },
            setTypes: (types) => set({ types }),
        }),
        {
            name: getLocalStorageKey("waypoint_types"),
        }
    )
);
