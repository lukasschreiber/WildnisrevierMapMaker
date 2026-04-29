import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

export type InteractionMode = "select" | "waypoint-add" | "path-edit" | "shape-edit";

interface InteractionModeState {
    mode: InteractionMode;
    activePathId: number | null;
    activeShapeId: number | null;

    activateSelect: () => void;
    activateWaypointAdd: () => void;
    activatePathEdit: () => void;
    activateShapeEdit: () => void;
};

export const useInteractionModeStore = create<InteractionModeState>()(
    persist(
        (set) => ({
            mode: "select",
            activePathId: null,
            activeShapeId: null,

            activateSelect: () =>
                set({
                    mode: "select",
                    activePathId: null,
                    activeShapeId: null,
                }),

            activateWaypointAdd: () =>
                set({
                    mode: "waypoint-add",
                    activePathId: null,
                    activeShapeId: null,
                }),

            activatePathEdit: () =>
                set({
                    mode: "path-edit",
                    activePathId: null,
                    activeShapeId: null,
                }),

            activateShapeEdit: () =>
                set({
                    mode: "shape-edit",
                    activePathId: null,
                    activeShapeId: null,
                }),
        }),
        {
            name: getLocalStorageKey("interaction_mode"),
            partialize: (state) => ({
                mode: state.mode,
                activePathId: state.activePathId,
                activeShapeId: state.activeShapeId,
            }),
        }
    )
);
