import { createContext, useContext } from "react";
import { Waypoint } from "../stores/useWaypoints";

interface MapContextType {
    map: L.Map;
    // Only for the standalone map, not for the editor...
    selectedWaypoint: Waypoint | null;
    setSelectedWaypoint: (waypoint: Waypoint | null) => void;
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a MapProvider");
    }
    return context.map;
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMapContext must be used within a MapProvider");
    }
    return context;
}
