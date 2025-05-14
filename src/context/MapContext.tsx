import { createContext, useContext } from "react";
import L from "leaflet";

interface MapContextType {
    map: L.Map;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children, map }: React.PropsWithChildren<{ map: L.Map }>) {
    return <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>;
}

export function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a MapProvider");
    }
    return context.map;
}