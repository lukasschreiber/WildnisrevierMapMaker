import { createContext, useCallback, useContext, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export type PathNode = {
    waypointId: number;
};

export type PathSegment = {
    id: number;
    from: PathNode;
    to: PathNode;
};

interface PathContextType {
    segments: PathSegment[];
    addMode: boolean;
    setAddMode: (addMode: boolean) => void;
    selectedId: number | null;
    startSegmentConnection: (waypointId: number) => void;
    endSegmentConnection: (waypointId: number) => void;
    cancelSegmentConnection: () => void;
    segmentConnectionStarted: boolean;
    segmentConnectionStartedWaypointId: number | null;
    addSegment: (from: PathNode, to: PathNode) => void;
    selectSegment: (id: number) => void;
    deselectSegment: () => void;
    deleteSegment: (id: number) => void;
    getSegmentById: (id: number) => PathSegment | undefined;
    setSegments: React.Dispatch<React.SetStateAction<PathSegment[]>>;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export function PathProvider({ children }: React.PropsWithChildren) {
    const [segments, setSegments] = useLocalStorage<PathSegment[]>("segments", []);
    const [addMode, setAddMode] = useLocalStorage("add-path-mode", false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [connectionStartedWaypointId, setConnectionStartedWaypointId] = useState<number | null>(null);

    const getNextId = () => {
        return segments.length > 0 ? Math.max(...segments.map((p) => p.id)) + 1 : 1;
    };

    const addSegment = useCallback(
        (from: PathNode, to: PathNode) => {
            const newSegment: PathSegment = { id: getNextId(), from, to };
            setSegments((prev) => [...prev, newSegment]);
        },
        [segments]
    );

    const selectSegment = useCallback((id: number) => {
        setSelectedId(id);
    }, []);

    const deselectSegment = useCallback(() => {
        setSelectedId(null);
    }, []);

    const deleteSegment = useCallback(
        (id: number) => {
            setSegments((prev) => prev.filter((segment) => segment.id !== id));
            if (selectedId === id) {
                deselectSegment();
            }
        },
        [selectedId, deselectSegment, setSegments]
    );

    const getSegmentById = useCallback(
        (id: number) => {
            return segments.find((segment) => segment.id === id);
        },
        [segments]
    );

    const startSegmentConnection = useCallback((waypointId: number) => {
        setConnectionStartedWaypointId(waypointId);
    }, []);

    const endSegmentConnection = useCallback(
        (waypointId: number) => {
            if (connectionStartedWaypointId !== null) {
                if (connectionStartedWaypointId !== waypointId) {
                    addSegment({ waypointId: connectionStartedWaypointId }, { waypointId });
                }
                setConnectionStartedWaypointId(null);
            }
        },
        [connectionStartedWaypointId, addSegment]
    );

    const cancelSegmentConnection = useCallback(() => {
        setConnectionStartedWaypointId(null);
    }, []);

    return (
        <PathContext.Provider
            value={{
                selectedId,
                addMode,
                setAddMode,
                segments,
                addSegment,
                selectSegment,
                deselectSegment,
                deleteSegment,
                getSegmentById,
                startSegmentConnection,
                setSegments,
                cancelSegmentConnection,
                endSegmentConnection,
                segmentConnectionStarted: connectionStartedWaypointId !== null,
                segmentConnectionStartedWaypointId: connectionStartedWaypointId,
            }}
        >
            {children}
        </PathContext.Provider>
    );
}

export function usePathContext(): PathContextType {
    const context = useContext(PathContext);
    if (!context) {
        throw new Error("usePathContext must be used within a PathProvider");
    }
    return context;
}
