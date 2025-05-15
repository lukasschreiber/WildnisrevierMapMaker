import { createContext, useContext, useState } from "react";
import L from "leaflet";
import { Waypoint } from "../stores/useWaypoints";

interface MapContextType {
    map: L.Map;
    selectedWaypoint: Waypoint | null;
    setSelectedWaypoint: (waypoint: Waypoint | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children, map }: React.PropsWithChildren<{ map: L.Map }>) {
    const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
    return <MapContext.Provider value={{ map, selectedWaypoint, setSelectedWaypoint }}>{children}</MapContext.Provider>;
}

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