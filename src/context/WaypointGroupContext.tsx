import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useWaypointContext } from "./WaypointContext";

export type WaypointGroup = {
    id: number;
    name: string;
    hidden: boolean;
}

export type WaypointGroupContextType = {
    waypointGroups: WaypointGroup[];
    addWaypointGroup: (group: WaypointGroup) => void;
    removeWaypointGroup: (id: number) => void;
    updateWaypointGroup: (id: number, group: Partial<WaypointGroup>) => void;
    getWaypointGroupById: (id: number) => WaypointGroup | undefined;
    isDeletable: (id: number) => boolean;
    setWaypointGroups: React.Dispatch<React.SetStateAction<WaypointGroup[]>>;
};

const WaypointGroupContext = createContext<WaypointGroupContextType | undefined>(undefined);

export function WaypointGroupProvider({ children }: React.PropsWithChildren) {
    const { waypoints } = useWaypointContext();
    const [waypointGroups, setWaypointGroups] = useLocalStorage<WaypointGroup[]>("waypoint_groups", []);

    const addWaypointGroup = (group: WaypointGroup) => {
        setWaypointGroups((prev) => [...prev, group]);
    };

    const removeWaypointGroup = (id: number) => {
        if (confirm("Are you sure you want to delete this waypoint group?")) {
            setWaypointGroups((prev) => prev.filter((group) => group.id !== id));
        }
    };

    const updateWaypointGroup = (id: number, group: Partial<WaypointGroup>) => {
        setWaypointGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...group } : g)));
    };

    const isDeletable = (id: number) => {
        return waypoints.every((waypoint) => waypoint.groupId !== id);
    };

    const getWaypointGroupById = (id: number) => {
        return waypointGroups.find((group) => group.id === id);
    };

    return (
        <WaypointGroupContext.Provider
            value={{
                waypointGroups,
                addWaypointGroup,
                removeWaypointGroup,
                updateWaypointGroup,
                getWaypointGroupById,
                setWaypointGroups,
                isDeletable,
            }}
        >
            {children}
        </WaypointGroupContext.Provider>
    );
}

export function useWaypointGroupContext() {
    const context = useContext(WaypointGroupContext);
    if (!context) {
        throw new Error("useWaypointGroupContext must be used within a WaypointGroupProvider");
    }
    return context;
}