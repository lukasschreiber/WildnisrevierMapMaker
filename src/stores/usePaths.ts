import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

export interface PathNode {
    waypointId: number;
}

export interface PathSegment {
    id: number;
    from: PathNode;
    to: PathNode;
}

export interface Path {
    id: number;
    name: string;
    color: string;
    outlineWidth: number;
    outlineColor: string;
    width: number;
    tension: number;
    segments: PathSegment[];
    hidden?: boolean;
    order?: number;
    opacity?: number;
    linecap?: "round" | "butt" | "square";
    style?: "solid" | "dashed" | "dotted";
    dasharray?: string;
}

interface PathState {
    paths: Path[];
    
    // Actions
    setPaths: (paths: Path[]) => void;
    addPath: (name: string, color: string) => number;
    updatePath: (id: number, path: Partial<Path>) => void;
    deletePath: (id: number) => void;

    addSegment: (pathId: number, from: PathNode, to: PathNode) => number;
    deleteSegment: (id: number) => void;
    
    getSegmentById: (id: number) => PathSegment | undefined;
    getPathById: (id: number) => Path | undefined;
}

export const usePathStore = create<PathState>()(
    persist(
        (set, get) => ({
            paths: [],
            addModeReferencePathId: null,
            selectedSegmentId: null,
            addMode: false,
            connectionStartedWaypointId: null,
            segmentConnectionStarted: false,

            addPath: (name, color) => {
                const nextId = get().paths.reduce((max, path) => Math.max(max, path.id), 0) + 1;
                const newPath: Path = {
                    id: nextId,
                    name,
                    color,
                    segments: [],
                    outlineWidth: 1,
                    outlineColor: color,
                    tension: 0.5,
                    hidden: false,
                    width: 5,
                };
                set((state) => ({ paths: [...state.paths, newPath] }));
                return nextId;
            },
            updatePath: (id, updated) => {
                set((state) => ({
                    paths: state.paths.map((p) => (p.id === id ? { ...p, ...updated } : p)),
                }));
            },
            deletePath: (id) => {
                set((state) => ({
                    paths: state.paths.filter((p) => p.id !== id),
                    addMode: false,
                    addModeReferencePathId: null,
                }));
            },
            setPaths: (paths) => set({ paths }),
            getPathById: (id) => get().paths.find((p) => p.id === id),
            getSegmentById: (id) =>
                get()
                    .paths.flatMap((p) => p.segments)
                    .find((s) => s.id === id),
            addSegment: (pathId, from, to) => {
                const nextId =
                    get()
                        .paths.flatMap((p) => p.segments)
                        .reduce((max, seg) => Math.max(max, seg.id), 0) + 1;
                const newSegment: PathSegment = { id: nextId, from, to };

                set((state) => ({
                    paths: state.paths.map((p) =>
                        p.id === pathId ? { ...p, segments: [...p.segments, newSegment] } : p,
                    ),
                }));
                return nextId;
            },
            deleteSegment: (id) => {
                set((state) => ({
                    paths: state.paths.map((p) => ({
                        ...p,
                        segments: p.segments.filter((s) => s.id !== id),
                    })),
                }));
            },
        }),
        {
            name: getLocalStorageKey("paths"),
            partialize: (state) => ({
                paths: state.paths,
            }),
        },
    ),
);
