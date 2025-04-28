import { createContext, useCallback, useContext, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

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
};

export type ShapeContextType = {
    shapes: Shape[];
    addMode: boolean;
    setAddMode: React.Dispatch<React.SetStateAction<boolean>>;
    selectedId: number | null;
    selectShape: (id: number) => void;
    deselectShape: () => void;
    addModeReferenceShapeId: number | null;
    setAddModeReferenceShapeId: React.Dispatch<React.SetStateAction<number | null>>;
    removeShape: (id: number) => void;
    addShape: (name: string, color: string, texture?: string, shapeType?: "smooth" | "straight") => void;
    addNode: (shapeId: number, waypointId: number) => void;
    removeNode: (shapeId: number, waypointId: number) => void;
    updateShape: (id: number, shape: Partial<Shape>) => void;
    getShapeById: (id: number) => Shape | undefined;
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
};

const ShapeContext = createContext<ShapeContextType | undefined>(undefined);

export function ShapeProvider({ children }: React.PropsWithChildren) {
    const [shapes, setShapes] = useLocalStorage<Shape[]>("shapes", []);
    const [addMode, setAddMode] = useLocalStorage("add-shape-mode", false);
    const [addModeReferenceShapeId, setAddModeReferenceShapeId] = useLocalStorage<number | null>(
        "add-shape-reference-shape-id",
        null
    );
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const getNextId = useCallback(() => {
        return shapes.length > 0 ? Math.max(...shapes.map((s) => s.id)) + 1 : 1;
    }, [shapes]);

    const selectShape = useCallback((id: number) => {
        setSelectedId(id);
    }, []);

    const deselectShape = useCallback(() => {
        setSelectedId(null);
    }, []);

    const removeShape = useCallback(
        (id: number) => {
            setShapes((prev) => prev.filter((shape) => shape.id !== id));
            if (selectedId === id) {
                deselectShape();
            }
        },
        [selectedId, deselectShape, setShapes]
    );

    const updateShape = useCallback(
        (id: number, shape: Partial<Shape>) => {
            setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...shape } : s)));
        },
        [setShapes]
    );

    const dedupeNodes = useCallback((nodes: ShapeNode[]) => {
        const uniqueNodes = new Map<number, ShapeNode>();
        nodes.forEach((node) => {
            if (!uniqueNodes.has(node.waypointId)) {
                uniqueNodes.set(node.waypointId, node);
            }
        });
        return Array.from(uniqueNodes.values());
    }, []);

    const addNode = useCallback(
        (shapeId: number, waypointId: number) => {
            setShapes((prev) => [
                ...prev.map((shape) =>
                    shape.id === shapeId ? { ...shape, nodes: dedupeNodes([...shape.nodes, { waypointId }]) } : shape
                ),
            ]);
        },
        [dedupeNodes, setShapes]
    );

    const removeNode = useCallback(
        (shapeId: number, waypointId: number) => {
            if (addModeReferenceShapeId === shapeId) {
                setAddModeReferenceShapeId(null);
                setAddMode(false);
            }
            setShapes((prev) => [
                ...prev.map((shape) =>
                    shape.id === shapeId
                        ? { ...shape, nodes: shape.nodes.filter((node) => node.waypointId !== waypointId) }
                        : shape
                ),
            ]);
        },
        [addModeReferenceShapeId, setAddMode, setAddModeReferenceShapeId, setShapes]
    );

    const getShapeById = useCallback(
        (id: number): Shape | undefined => {
            return shapes.find((shape) => shape.id === id);
        },
        [shapes]
    );

    const addShape = useCallback(
        (name: string, color: string, texture?: string, shapeType: "smooth" | "straight" = "smooth") => {
            const newShape: Shape = { id: getNextId(), nodes: [], name, color, texture, shapeType };
            setShapes((prev) => [...prev, newShape]);
        },
        [getNextId, setShapes]
    );

    return (
        <ShapeContext.Provider
            value={{
                shapes,
                addMode,
                setAddMode,
                selectedId,
                selectShape,
                deselectShape,
                removeShape,
                addModeReferenceShapeId,
                setAddModeReferenceShapeId,
                updateShape,
                getShapeById,
                setShapes,
                addShape,
                addNode,
                removeNode,
            }}
        >
            {children}
        </ShapeContext.Provider>
    );
}

export function useShapeContext() {
    const context = useContext(ShapeContext);
    if (!context) {
        throw new Error("useShapeContext must be used within a ShapeProvider");
    }
    return context;
}
