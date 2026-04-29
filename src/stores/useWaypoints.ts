// store/useWaypointStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateRelativeWaypoint } from "../renderer/relativeWaypoints";
import { usePathStore } from "./usePaths";
import { useShapeStore } from "./useShapes";
import { getLocalStorageKey } from "../utils/keys";

export type Waypoint = {
    id: number;
    lat: number;
    lng: number;
    name?: string;
    baseId?: number;
    typeId: number;
    groupId?: number;
    additionalText?: string;
    hidden?: boolean;
};

export interface WaypointState {
    waypoints: Waypoint[];
    selectedId: number | null;
    currentPosition: { lat: number; lng: number } | null;
    addMode: boolean;
    newWaypointName: string;
    newWaypointType: number;
    newWaypointGroup?: number;

    setCurrentPosition: (pos: { lat: number; lng: number } | null) => void;
    toggleAddMode: () => void;
    setAddMode: (value: boolean) => void;

    addWaypoint: (lat: number, lng: number, baseId?: number, name?: string, typeId?: number, groupId?: number) => void;
    addRelativeWaypoint: (baseId: number, distance: number, bearing: number, name?: string, typeId?: number) => void;

    selectWaypoint: (id: number) => void;
    deselectWaypoint: () => void;
    deleteWaypoint: (id: number) => void;
    getWaypointById: (id: number) => Waypoint | undefined;
    updateWaypointPosition: (id: number, lat: number, lng: number) => void;
    updateWaypointName: (id: number, name: string) => void;
    toggleWaypointHidden: (id: number) => void;
    updateWaypointAdditionalText: (id: number, text: string) => void;
    updateWaypointType: (id: number, typeId: number) => void;
    updateWaypointGroup: (id: number, groupId?: number) => void;
    isDeletable: (id: number) => boolean;

    setWaypoints: (wps: Waypoint[]) => void;

    setNewWaypointName: (name: string) => void;
    setNewWaypointType: (typeId: number) => void;
    setNewWaypointGroup: (groupId?: number) => void;
}

export const useWaypointStore = create<WaypointState>()(
    persist(
        (set, get) => ({
            waypoints: [],
            selectedId: null,
            currentPosition: null,
            addMode: false,
            newWaypointName: "",
            newWaypointType: 1,
            newWaypointGroup: undefined,

            setCurrentPosition: (pos) => set({ currentPosition: pos }),
            toggleAddMode: () => set((s) => ({ addMode: !s.addMode })),
            setAddMode: (value) => set({ addMode: value }),

            addWaypoint: (lat, lng, baseId, name, typeId, groupId) => {
                const state = get();
                const id = state.waypoints.length > 0 ? Math.max(...state.waypoints.map((w) => w.id)) + 1 : 1;
                const newWaypoint: Waypoint = {
                    id,
                    lat,
                    lng,
                    baseId,
                    typeId: typeId ?? state.newWaypointType,
                    groupId: groupId ?? state.newWaypointGroup,
                    name: name ?? state.newWaypointName,
                };
                set({ waypoints: [...state.waypoints, newWaypoint] });
            },

            addRelativeWaypoint: (baseId, distance, bearing, name, typeId) => {
                const base = get().waypoints.find((w) => w.id === baseId);
                if (!base) return;
                const { lat, lng } = calculateRelativeWaypoint(base.lat, base.lng, distance, bearing);
                get().addWaypoint(lat, lng, baseId, name, typeId);
            },

            selectWaypoint: (id) => set({ selectedId: id }),
            deselectWaypoint: () => set({ selectedId: null }),

            deleteWaypoint: (id) => {
                if (!get().isDeletable(id)) {
                    alert("Cannot delete waypoint that is used in a path or shape.");
                    return;
                }
                const { waypoints } = get();
                set({
                    waypoints: waypoints.filter((wp) => wp.id !== id),
                    selectedId: null,
                });
            },

            getWaypointById: (id) => get().waypoints.find((wp) => wp.id === id),

            updateWaypointPosition: (id, lat, lng) =>
                set((s) => ({
                    waypoints: s.waypoints.map((wp) => (wp.id === id ? { ...wp, lat, lng } : wp)),
                })),

            updateWaypointName: (id, name) =>
                set((s) => ({
                    waypoints: s.waypoints.map((wp) => (wp.id === id ? { ...wp, name } : wp)),
                })),

            toggleWaypointHidden: (id) =>
                set((s) => ({
                    waypoints: s.waypoints.map((wp) =>
                        wp.id === id ? { ...wp, hidden: !wp.hidden } : wp
                    ),
                })),

            updateWaypointType: (id, typeId) =>
                set((s) => ({
                    waypoints: s.waypoints.map((wp) => (wp.id === id ? { ...wp, typeId } : wp)),
                })),

            updateWaypointAdditionalText: (id, text) =>
                set((s) => ({
                    waypoints: s.waypoints.map((wp) => (wp.id === id ? { ...wp, additionalText: text } : wp)),
                })),

            updateWaypointGroup: (id, groupId) =>
                set((s) => ({
                    waypoints: s.waypoints.map((wp) => (wp.id === id ? { ...wp, groupId } : wp)),
                })),

            isDeletable: (id) => {
                const { waypoints } = get();
                const { paths } = usePathStore.getState();
                const { shapes } = useShapeStore.getState();
                const waypoint = waypoints.find((wp) => wp.id === id);
                if (!waypoint) {
                    console.warn(`Waypoint with id ${id} not found when checking if deletable.`);
                    return false;
                }
                const usedInSegments = paths.some((path) =>
                    path.segments.some((s) => s.from.waypointId === id || s.to.waypointId === id)
                );
                const usedInShapes = shapes.some((s) => s.nodes.some((n) => n.waypointId === id));
                const usedAsBase = waypoints.some((wp) => wp.baseId === id);
                return !usedInSegments && !usedInShapes && !usedAsBase;
            },

            setWaypoints: (wps) => set({ waypoints: wps }),

            setNewWaypointName: (name) => set({ newWaypointName: name }),
            setNewWaypointType: (typeId) => set({ newWaypointType: typeId }),
            setNewWaypointGroup: (groupId) => set({ newWaypointGroup: groupId }),
        }),
        {
            name: getLocalStorageKey("waypoints"),
            partialize: (state) => ({
                waypoints: state.waypoints,
                addMode: state.addMode,
            }),
        }
    )
);
