import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useWaypointContext } from "./WaypointContext";

export type WaypointType = {
    id: number;
    name: string;
    icon: "circle" | "square" | "triangle" | "star" | "cross" | "diamond" | "apple" | "cherry" | "pear" | "plum";
    color: string;
    hasTwoColors: boolean;
    color2?: string;
    hidden: boolean;
};

interface WaypointTypeContextType {
    waypointTypes: WaypointType[];
    addWaypointType: (type: WaypointType) => void;
    removeWaypointType: (id: number) => void;
    updateWaypointType: (id: number, type: Partial<WaypointType>) => void;
    getWaypointTypeById: (id: number) => WaypointType | undefined;
    isDeletable: (id: number) => boolean;
    setWaypointTypes: React.Dispatch<React.SetStateAction<WaypointType[]>>;
}

const WaypointTypeContext = createContext<WaypointTypeContextType | undefined>(undefined);

export function WaypointTypeProvider({ children }: React.PropsWithChildren) {
    const { waypoints } = useWaypointContext();
    const [waypointTypes, setWaypointTypes] = useLocalStorage<WaypointType[]>("waypoint_types", [
        { id: 1, name: "Default", icon: "circle", color: "#FF0000", hidden: false, hasTwoColors: false },
        { id: 2, name: "Custom", icon: "square", color: "#00FF00", hidden: false, hasTwoColors: false },
    ]);

    const addWaypointType = (type: WaypointType) => {
        setWaypointTypes((prev) => [...prev, type]);
    };

    const removeWaypointType = (id: number) => {
        if (confirm("Are you sure you want to delete this waypoint type?")) {
            setWaypointTypes((prev) => prev.filter((type) => type.id !== id));
        }
    };

    const updateWaypointType = (id: number, type: Partial<WaypointType>) => {
        setWaypointTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...type } : t)));
    };

    const isDeletable = (id: number) => {
        return !waypoints.some((waypoint) => waypoint.typeId === id);
    };

    const getWaypointTypeById = (id: number) => {
        return waypointTypes.find((type) => type.id === id);
    };

    return (
        <WaypointTypeContext.Provider
            value={{
                waypointTypes,
                addWaypointType,
                removeWaypointType,
                updateWaypointType,
                getWaypointTypeById,
                setWaypointTypes,
                isDeletable,
            }}
        >
            {children}
        </WaypointTypeContext.Provider>
    );
}

export function useWaypointTypeContext() {
    const context = useContext(WaypointTypeContext);
    if (!context) {
        throw new Error("useWaypointTypeContext must be used within a WaypointTypeProvider");
    }
    return context;
}
