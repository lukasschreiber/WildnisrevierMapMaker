import { useState } from "react";
import L from "leaflet";
import { Waypoint } from "../stores/useWaypoints";
import { MapContext } from "./useMap";

export function MapProvider({ children, map }: React.PropsWithChildren<{ map: L.Map }>) {
    const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
    return <MapContext.Provider value={{ map, selectedWaypoint, setSelectedWaypoint }}>{children}</MapContext.Provider>;
}