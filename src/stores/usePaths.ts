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

interface PathState {
  segments: PathSegment[];
  addMode: boolean;
  selectedId: number | null;
  connectionStartedWaypointId: number | null;

  // Actions
  setAddMode: (addMode: boolean) => void;
  addSegment: (from: PathNode, to: PathNode) => void;
  selectSegment: (id: number) => void;
  deselectSegment: () => void;
  deleteSegment: (id: number) => void;
  getSegmentById: (id: number) => PathSegment | undefined;
  startSegmentConnection: (waypointId: number) => void;
  endSegmentConnection: (waypointId: number) => void;
  cancelSegmentConnection: () => void;
  setSegments: (segments: PathSegment[]) => void;
}

export const usePathStore = create<PathState>()(
  persist(
    (set, get) => ({
      segments: [],
      addMode: false,
      selectedId: null,
      connectionStartedWaypointId: null,

      setAddMode: (addMode) => set({ addMode }),

      getSegmentById: (id) => get().segments.find((s) => s.id === id),

      setSegments: (segments) => set({ segments }),

      addSegment: (from, to) => {
        const nextId = get().segments.length > 0
          ? Math.max(...get().segments.map((s) => s.id)) + 1
          : 1;
        const newSegment: PathSegment = { id: nextId, from, to };
        set((state) => ({ segments: [...state.segments, newSegment] }));
      },

      selectSegment: (id) => set({ selectedId: id }),
      deselectSegment: () => set({ selectedId: null }),

      deleteSegment: (id) =>
        set((state) => ({
          segments: state.segments.filter((seg) => seg.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      startSegmentConnection: (waypointId) => {
        set({ connectionStartedWaypointId: waypointId });
      },

      endSegmentConnection: (waypointId) => {
        const fromId = get().connectionStartedWaypointId;
        if (fromId !== null && fromId !== waypointId) {
          get().addSegment({ waypointId: fromId }, { waypointId });
        }
        set({ connectionStartedWaypointId: null });
      },

      cancelSegmentConnection: () => set({ connectionStartedWaypointId: null }),
    }),
    {
      name: getLocalStorageKey("paths"),
      partialize: (state) => ({
        segments: state.segments,
        addMode: state.addMode,
      }),
    }
  )
);
