import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWaypointStore } from "./useWaypoints"; // Adjust if path differs
import { getLocalStorageKey } from "../utils/keys";

export type WaypointGroup = {
    id: number;
    name: string;
    hidden: boolean;
};

type WaypointGroupStore = {
    waypointGroups: WaypointGroup[];
    addWaypointGroup: (group: WaypointGroup) => void;
    removeWaypointGroup: (id: number) => void;
    updateWaypointGroup: (id: number, group: Partial<WaypointGroup>) => void;
    getWaypointGroupById: (id: number) => WaypointGroup | undefined;
    isDeletable: (id: number) => boolean;
    setWaypointGroups: (groups: WaypointGroup[]) => void;
};

export const useWaypointGroupStore = create<WaypointGroupStore>()(
    persist(
        (set, get) => ({
            waypointGroups: [],

            addWaypointGroup: (group) => {
                set((state) => ({
                    waypointGroups: [...state.waypointGroups, group],
                }));
            },

            removeWaypointGroup: (id) => {
                if (confirm("Are you sure you want to delete this waypoint group?")) {
                    set((state) => ({
                        waypointGroups: state.waypointGroups.filter((group) => group.id !== id),
                    }));
                }
            },

            updateWaypointGroup: (id, group) => {
                set((state) => ({
                    waypointGroups: state.waypointGroups.map((g) =>
                        g.id === id ? { ...g, ...group } : g
                    ),
                }));
            },

            getWaypointGroupById: (id) => {
                return get().waypointGroups.find((group) => group.id === id);
            },

            isDeletable: (id) => {
                const waypoints = useWaypointStore.getState().waypoints;
                return waypoints.every((wp) => wp.groupId !== id);
            },

            setWaypointGroups: (groups) => {
                set({ waypointGroups: groups });
            },
        }),
        {
            name: getLocalStorageKey("waypoint_groups"),
        }
    )
);
