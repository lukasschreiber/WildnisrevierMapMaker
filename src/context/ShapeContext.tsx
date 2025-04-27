import { createContext, useContext, useState } from "react";
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

    const getNextId = () => {
        return shapes.length > 0 ? Math.max(...shapes.map((s) => s.id)) + 1 : 1;
    };

    const selectShape = (id: number) => {
        setSelectedId(id);
    };

    const deselectShape = () => {
        setSelectedId(null);
    };

    const removeShape = (id: number) => {
        setShapes((prev) => prev.filter((shape) => shape.id !== id));
        if (selectedId === id) {
            deselectShape();
        }
    };

    const updateShape = (id: number, shape: Partial<Shape>) => {
        setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...shape } : s)));
    };

    const dedupeNodes = (nodes: ShapeNode[]) => {
        const uniqueNodes = new Map<number, ShapeNode>();
        nodes.forEach((node) => {
            if (!uniqueNodes.has(node.waypointId)) {
                uniqueNodes.set(node.waypointId, node);
            }
        });
        return Array.from(uniqueNodes.values());
    }

    const addNode = (shapeId: number, waypointId: number) => {
        setShapes((prev) => [
            ...prev.map((shape) =>
                shape.id === shapeId ? { ...shape, nodes: dedupeNodes([...shape.nodes, { waypointId }]) } : shape
            ),
        ]);
    };

    const removeNode = (shapeId: number, waypointId: number) => {
        setShapes((prev) => [
            ...prev.map((shape) =>
                shape.id === shapeId
                    ? { ...shape, nodes: shape.nodes.filter((node) => node.waypointId !== waypointId) }
                    : shape
            ),
        ]);
    };

    const getShapeById = (id: number): Shape | undefined => {
        return shapes.find((shape) => shape.id === id);
    };

    const addShape = (name: string, color: string, texture?: string, shapeType: "smooth" | "straight" = "smooth") => {
        const newShape: Shape = { id: getNextId(), nodes: [], name, color, texture, shapeType };
        setShapes((prev) => [...prev, newShape]);
    };

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
