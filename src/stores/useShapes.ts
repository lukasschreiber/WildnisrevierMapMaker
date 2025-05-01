import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

export type ShapeNode = {
    waypointId: number;
};

export type Shape = {
    id: number;
    nodes: ShapeNode[];
    name: string;
    color: string;
    texture?: string;
    alpha?: number;
    hasOutline?: boolean;
    shapeType: "smooth" | "straight";
    hidden?: boolean;
    order?: number;
};

type ShapeState = {
    shapes: Shape[];
    selectedId: number | null;
    addMode: boolean;
    addModeReferenceShapeId: number | null;

    setAddMode: (val: boolean) => void;
    setAddModeReferenceShapeId: (id: number | null) => void;
    selectShape: (id: number) => void;
    deselectShape: () => void;
    setShapes: (shapes: Shape[]) => void;
    getShapeById: (id: number) => Shape | undefined;
    updateShape: (id: number, shape: Partial<Shape>) => void;
    addShape: (name: string, color: string, texture?: string, shapeType?: "smooth" | "straight") => void;
    removeShape: (id: number) => void;
    addNode: (shapeId: number, waypointId: number) => void;
    removeNode: (shapeId: number, waypointId: number) => void;
};

export const useShapeStore = create<ShapeState>()(
    persist(
        (set, get) => ({
            shapes: [],
            selectedId: null,
            addMode: false,
            addModeReferenceShapeId: null,

            setAddMode: (val) => set({ addMode: val }),
            setAddModeReferenceShapeId: (id) => set({ addModeReferenceShapeId: id }),

            selectShape: (id) => set({ selectedId: id }),
            deselectShape: () => set({ selectedId: null }),

            setShapes: (shapes) => set({ shapes }),

            getShapeById: (id) => get().shapes.find((s) => s.id === id),

            updateShape: (id, updated) =>
                set((state) => ({
                    shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updated } : s)),
                })),

            addShape: (name, color, texture, shapeType = "smooth") => {
                const nextId = get().shapes.length > 0 ? Math.max(...get().shapes.map((s) => s.id)) + 1 : 1;
                const newShape: Shape = { id: nextId, nodes: [], name, color, texture, shapeType };
                set((state) => ({ shapes: [...state.shapes, newShape] }));
            },

            removeShape: (id) =>
                set((state) => {
                    const isSelected = state.selectedId === id;
                    return {
                        shapes: state.shapes.filter((s) => s.id !== id),
                        ...(isSelected ? { selectedId: null } : {}),
                    };
                }),

            addNode: (shapeId, waypointId) =>
                set((state) => ({
                    shapes: state.shapes.map((s) =>
                        s.id === shapeId
                            ? {
                                ...s,
                                nodes: Array.from(new Map([...s.nodes, { waypointId }].map(n => [n.waypointId, n])).values()),
                            }
                            : s
                    ),
                })),

            removeNode: (shapeId, waypointId) =>
                set((state) => {
                    if (state.addModeReferenceShapeId === shapeId) {
                        return {
                            addMode: false,
                            addModeReferenceShapeId: null,
                            shapes: state.shapes.map((s) =>
                                s.id === shapeId
                                    ? { ...s, nodes: s.nodes.filter((n) => n.waypointId !== waypointId) }
                                    : s
                            ),
                        };
                    }

                    return {
                        shapes: state.shapes.map((s) =>
                            s.id === shapeId
                                ? { ...s, nodes: s.nodes.filter((n) => n.waypointId !== waypointId) }
                                : s
                        ),
                    };
                }),
        }),
        {
            name: getLocalStorageKey("shapes"),
            partialize: (state) => ({
                shapes: state.shapes,
                addMode: state.addMode,
                addModeReferenceShapeId: state.addModeReferenceShapeId,
            }),
        }
    )
);
