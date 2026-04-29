import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

export type InteractionMode = "select" | "waypoint-add" | "path-edit" | "shape-edit";

type InteractionModeState = {
    mode: InteractionMode;
    activePathId: number | null;
    activeShapeId: number | null;

    activateSelect: () => void;
    activateWaypointAdd: () => void;
    activatePathEdit: (pathId: number) => void;
    activateShapeEdit: (shapeId: number) => void;
    togglePathEdit: (pathId: number) => void;
    toggleShapeEdit: (shapeId: number) => void;
};

export const useInteractionModeStore = create<InteractionModeState>()(
    persist(
        (set, get) => ({
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

            activatePathEdit: (pathId) =>
                set({
                    mode: "path-edit",
                    activePathId: pathId,
                    activeShapeId: null,
                }),

            activateShapeEdit: (shapeId) =>
                set({
                    mode: "shape-edit",
                    activePathId: null,
                    activeShapeId: shapeId,
                }),

            togglePathEdit: (pathId) => {
                const { mode, activePathId } = get();
                if (mode === "path-edit" && activePathId === pathId) {
                    get().activateSelect();
                    return;
                }
                get().activatePathEdit(pathId);
            },

            toggleShapeEdit: (shapeId) => {
                const { mode, activeShapeId } = get();
                if (mode === "shape-edit" && activeShapeId === shapeId) {
                    get().activateSelect();
                    return;
                }
                get().activateShapeEdit(shapeId);
            },
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
