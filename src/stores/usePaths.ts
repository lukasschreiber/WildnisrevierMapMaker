import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

export type PathNode = {
  waypointId: number;
};

export type PathSegment = {
  id: number;
  from: PathNode;
  to: PathNode;
};

export type Path = {
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
}

interface PathState {
  paths: Path[];
  addMode: boolean;
  addModeReferencePathId: number | null;
  selectedSegmentId: number | null;
  connectionStartedWaypointId: number | null;
  segmentConnectionStarted: boolean;

  // Actions
  setAddMode: (addMode: boolean) => void;
  setAddModeReferencePathId: (id: number | null) => void;
  addPath: (name: string, color: string) => void;
  updatePath: (id: number, path: Partial<Path>) => void;
  deletePath: (id: number) => void;
  addSegment: (pathId: number, from: PathNode, to: PathNode) => void;
  selectSegment: (id: number) => void;
  deselectSegment: () => void;
  deleteSegment: (pathId: number, id: number) => void;
  getSegmentById: (id: number) => PathSegment | undefined;
  startSegmentConnection: (waypointId: number) => void;
  endSegmentConnection: (waypointId: number) => void;
  cancelSegmentConnection: () => void;
  setSegments: (pathId: number, segments: PathSegment[]) => void;
  setPaths: (paths: Path[]) => void;
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
        const newPath: Path = { id: nextId, name, color, segments: [], outlineWidth: 1, outlineColor: color, tension: 0.5, hidden: false, width: 5};
        set((state) => ({ paths: [...state.paths, newPath] }));
      },
      updatePath: (id, updated) => {
        set((state) => ({
          paths: state.paths.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        }));
      },
      deletePath: (id) => {
        set((state) => ({
          paths: state.paths.filter((p) => p.id !== id),
        }));
      },
      setAddMode: (addMode) => set({ addMode }),
      setAddModeReferencePathId: (id) => set({ addModeReferencePathId: id }),
      setPaths: (paths) => set({ paths }),
      getPathById: (id) => get().paths.find((p) => p.id === id),
      getSegmentById: (id) => get().paths.flatMap(p => p.segments).find((s) => s.id === id),
      setSegments: (pathId, segments) => {
        set((state) => ({
          paths: state.paths.map((p) =>
            p.id === pathId ? { ...p, segments } : p,
          ),
          selectedSegmentId: null,
        }));
      },
      addSegment: (pathId, from, to) => {
        const nextId = get().paths
          .find((p) => p.id === pathId)
          ?.segments.reduce((max, seg) => Math.max(max, seg.id), 0) ?? 0 + 1;

        const newSegment: PathSegment = { id: nextId, from, to };

        set((state) => ({
          paths: state.paths.map((p) =>
            p.id === pathId ? { ...p, segments: [...p.segments, newSegment] } : p
          ),
        }));
      },
      selectSegment: (id) => set({ selectedSegmentId: id }),
      deselectSegment: () => set({ selectedSegmentId: null }),
      deleteSegment: (pathId, id) =>
        set((state) => ({
          paths: state.paths.map((p) =>
            p.id === pathId
              ? {
                ...p,
                segments: p.segments.filter((seg) => seg.id !== id),
              }
              : p
          ),
          selectedSegmentId: (state.selectedSegmentId === id) ? null : state.selectedSegmentId,
        })),
      startSegmentConnection: (waypointId) => {
        set({ connectionStartedWaypointId: waypointId, segmentConnectionStarted: true });
      },
      endSegmentConnection: (waypointId) => {
        const fromId = get().connectionStartedWaypointId;
        if (fromId !== null && fromId !== waypointId) {
          get().addSegment(get().addModeReferencePathId!, { waypointId: fromId }, { waypointId });
        }
        set({ connectionStartedWaypointId: null, segmentConnectionStarted: false });
      },
      cancelSegmentConnection: () => set({ connectionStartedWaypointId: null, segmentConnectionStarted: false }),
    }),
    {
      name: getLocalStorageKey("paths"),
      partialize: (state) => ({
        paths: state.paths,
        addMode: state.addMode,
      }),
    }
  )
);
