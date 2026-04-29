import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WaypointGroup, useWaypointGroupStore } from "./useGroups";
import { Path, usePathStore } from "./usePaths";
import { Shape, useShapeStore } from "./useShapes";
import { Waypoint, useWaypointStore } from "./useWaypoints";
import { WaypointType, useWaypointTypeStore } from "./useWaypointTypes";
import { getLocalStorageKey } from "../utils/keys";

export type HistoryTarget = "waypoints" | "paths" | "shapes" | "waypointTypes" | "waypointGroups";

export interface HistoryValueByTarget {
    waypoints: Waypoint[];
    paths: Path[];
    shapes: Shape[];
    waypointTypes: Record<number, WaypointType>;
    waypointGroups: WaypointGroup[];
};

export interface HistoryMutation<T extends HistoryTarget = HistoryTarget> {
    target: T;
    before: HistoryValueByTarget[T];
    after: HistoryValueByTarget[T];
};

export interface HistoryStep {
    id: string;
    label: string;
    timestamp: number;
    mutations: HistoryMutation[];
};

interface HistoryState {
    version: number;
    maxSteps: number;
    past: HistoryStep[];
    future: HistoryStep[];
    isReplaying: boolean;
    canUndo: () => boolean;
    canRedo: () => boolean;

    pushStep: (step: HistoryStep) => void;
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;
};

const HISTORY_VERSION = 1;

function cloneValue<T>(value: T): T {
    return structuredClone(value);
}

function applySnapshot<T extends HistoryTarget>(target: T, value: HistoryValueByTarget[T]) {
    switch (target) {
        case "waypoints":
            useWaypointStore.getState().setWaypoints(value as HistoryValueByTarget["waypoints"]);
            break;
        case "paths":
            usePathStore.getState().setPaths(value as HistoryValueByTarget["paths"]);
            break;
        case "shapes":
            useShapeStore.getState().setShapes(value as HistoryValueByTarget["shapes"]);
            break;
        case "waypointTypes":
            useWaypointTypeStore.getState().setTypes(value as HistoryValueByTarget["waypointTypes"]);
            break;
        case "waypointGroups":
            useWaypointGroupStore.getState().setWaypointGroups(value as HistoryValueByTarget["waypointGroups"]);
            break;
        default:
            break;
    }
}

function applyStep(step: HistoryStep, direction: "undo" | "redo") {
    for (const mutation of step.mutations) {
        if (direction === "undo") {
            applySnapshot(mutation.target, cloneValue(mutation.before));
        } else {
            applySnapshot(mutation.target, cloneValue(mutation.after));
        }
    }
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set, get) => ({
            version: HISTORY_VERSION,
            maxSteps: 200,
            past: [],
            future: [],
            isReplaying: false,

            canUndo: () => get().past.length > 0,
            canRedo: () => get().future.length > 0,

            pushStep: (step) =>
                set((state) => {
                    const nextPast = [...state.past, step];
                    const overflow = Math.max(nextPast.length - state.maxSteps, 0);
                    return {
                        past: overflow > 0 ? nextPast.slice(overflow) : nextPast,
                        future: [],
                    };
                }),

            undo: () => {
                const { past, future } = get();
                const step = past[past.length - 1];
                if (!step) return;

                set({ isReplaying: true });
                try {
                    applyStep(step, "undo");
                    set({
                        past: past.slice(0, -1),
                        future: [step, ...future],
                    });
                } finally {
                    set({ isReplaying: false });
                }
            },

            redo: () => {
                const { past, future } = get();
                const [step, ...restFuture] = future;
                if (!step) return;

                set({ isReplaying: true });
                try {
                    applyStep(step, "redo");
                    set({
                        past: [...past, step],
                        future: restFuture,
                    });
                } finally {
                    set({ isReplaying: false });
                }
            },

            clearHistory: () =>
                set({
                    past: [],
                    future: [],
                }),
        }),
        {
            name: getLocalStorageKey("history"),
            version: HISTORY_VERSION,
            partialize: (state) => ({
                version: state.version,
                maxSteps: state.maxSteps,
                past: state.past,
                future: state.future,
            }),
        }
    )
);
