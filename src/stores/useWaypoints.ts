import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateRelativeWaypoint } from "../utils/relativeWaypoints";
import { usePathStore } from "./usePaths";
import { useShapeStore } from "./useShapes";
import { getLocalStorageKey } from "../utils/keys";
import { useInteractionsStore } from "./useInteractions";

export interface Waypoint {
    id: number;
    lat: number;
    lng: number;
    name?: string;
    baseId?: number;
    typeId: number;
    groupId?: number;
    additionalText?: string;
    hidden?: boolean;
}

export interface AddRelativeWaypointOptions {
    name?: string;
    typeId?: number;
    startWaypointId: number;
    distance: number;
    bearing: number;
}

export interface WaypointState {
    waypoints: Waypoint[];

    // TODO: find a better place for this
    currentPosition: { lat: number; lng: number } | null; // TODO should this be here?
    setCurrentPosition: (pos: { lat: number; lng: number } | null) => void;

    addWaypoint: (
        lat: number,
        lng: number,
        baseId?: number,
        name?: string,
        typeId?: number,
        groupId?: number,
    ) => number;
    addRelativeWaypoint: (options: AddRelativeWaypointOptions) => number;

    deleteWaypoint: (id: number) => void;
    getWaypointById: (id: number) => Waypoint | undefined;
    updateWaypoint(id: number, waypoint: Partial<Waypoint>): void;
    bulkUpdateWaypoints(updates: { id: number; data: Partial<Waypoint> }[]): void;
    bulkDeleteWaypoints(ids: number[]): void;
    isDeletable: (id: number) => boolean;

    setWaypoints: (wps: Waypoint[]) => void;
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

            addWaypoint: (lat, lng, baseId, name, typeId, groupId) => {
                const state = get();
                const id = state.waypoints.length > 0 ? Math.max(...state.waypoints.map((w) => w.id)) + 1 : 1;
                const { newWaypointConfig } = useInteractionsStore.getState();

                const newWaypoint: Waypoint = {
                    id,
                    lat,
                    lng,
                    baseId,
                    typeId: typeId ?? newWaypointConfig.typeId,
                    groupId: groupId ?? newWaypointConfig.groupId,
                    name: name ?? newWaypointConfig.name,
                };
                set({ waypoints: [...state.waypoints, newWaypoint] });
                return id;
            },

            // TODO: This should only store the distance and bearing, the lat/lng should be calculated when rendering
            addRelativeWaypoint: (options: AddRelativeWaypointOptions) => {
                const base = get().waypoints.find((w) => w.id === options.startWaypointId);
                if (!base) throw new Error(`Base waypoint with id ${options.startWaypointId} not found`);
                const { lat, lng } = calculateRelativeWaypoint(base.lat, base.lng, options.distance, options.bearing);
                return get().addWaypoint(lat, lng, options.startWaypointId, options.name, options.typeId);
            },

            deleteWaypoint: (id) => {
                if (!get().isDeletable(id)) {
                    alert("Cannot delete waypoint that is used in a path or shape.");
                    return;
                }
                const { waypoints } = get();
                set({
                    waypoints: waypoints.filter((wp) => wp.id !== id),
                });

                useInteractionsStore.getState().deselect("waypoint", id);
            },

            getWaypointById: (id) => get().waypoints.find((wp) => wp.id === id),

            updateWaypoint: (id, updated) =>
                set((state) => ({
                    waypoints: state.waypoints.map((wp) => (wp.id === id ? { ...wp, ...updated } : wp)),
                })),

            bulkUpdateWaypoints: (updates) =>
                set((state) => ({
                    waypoints: state.waypoints.map((wp) => {
                        const update = updates.find((u) => u.id === wp.id);
                        return update ? { ...wp, ...update.data } : wp;
                    }),
                })),

            bulkDeleteWaypoints: (ids) => {
                set((state) => ({
                    waypoints: state.waypoints.filter((wp) => !ids.includes(wp.id)),
                }));

                for (const id of ids) {
                    useInteractionsStore.getState().deselect("waypoint", id);
                }
            },

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
                    path.segments.some((s) => s.from.waypointId === id || s.to.waypointId === id),
                );
                const usedInShapes = shapes.some((s) => s.nodes.some((n) => n.waypointId === id));
                const usedAsBase = waypoints.some((wp) => wp.baseId === id);
                return !usedInSegments && !usedInShapes && !usedAsBase;
            },

            setWaypoints: (wps) => set({ waypoints: wps }),
        }),
        {
            name: getLocalStorageKey("waypoints"),
            partialize: (state) => ({
                waypoints: state.waypoints,
            }),
        },
    ),
);
