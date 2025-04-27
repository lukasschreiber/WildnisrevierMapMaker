import React, { createContext, useCallback, useContext, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { calculateRelativeWaypoint } from "../renderer/relativeWaypoints";

// Type for the Waypoint
export type Waypoint = {
    id: number;
    lat: number;
    lng: number;
    name?: string;
    baseId?: number;
    typeId: number;
    groupId?: number;
};

// Type for the Context
interface WaypointContextType {
    waypoints: Waypoint[];
    selectedId: number | null;
    currentPosition: { lat: number; lng: number } | null;
    setCurrentPosition: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
    toggleAddMode: () => void;
    setAddMode: (addMode: boolean) => void;
    addMode: boolean;
    addWaypoint: (lat: number, lng: number, baseId?: number, name?: string, typeId?: number, groupId?: number) => void;
    addRelativeWaypoint: (baseId: number, distance: number, bearing: number, name?: string, typeId?: number) => void;
    selectWaypoint: (id: number) => void;
    deselectWaypoint: () => void;
    deleteWaypoint: (id: number) => void;
    getWaypointById: (id: number) => Waypoint | undefined;
    updateWaypointPosition: (id: number, lat: number, lng: number) => void;
    updateWaypointName: (id: number, name: string) => void;
    updateWaypointType: (id: number, typeId: number) => void;
    updateWaypointGroup: (id: number, groupId?: number) => void;
    isDeletable: (id: number) => boolean;
    setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;

    setNewWaypointName: (name: string) => void;
    setNewWaypointType: (typeId: number) => void;
    setNewWaypointGroup: (groupId?: number) => void;
    newWaypointName: string;
    newWaypointType: number;
    newWaypointGroup: number | undefined;
}

// Create the context with default values
const WaypointContext = createContext<WaypointContextType | undefined>(undefined);

// Provider component
export function WaypointProvider({ children }: React.PropsWithChildren) {
    const [waypoints, setWaypoints] = useLocalStorage<Waypoint[]>("waypoints", []);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [addMode, setAddMode] = useLocalStorage("add-waypoint-mode", false);
    const [newWaypointName, setNewWaypointName] = useState<string>("");
    const [newWaypointType, setNewWaypointType] = useState<number>(1);
    const [newWaypointGroup, setNewWaypointGroup] = useState<number | undefined>(undefined);

    const getNextId = () => {
        return waypoints.length > 0 ? Math.max(...waypoints.map((w) => w.id)) + 1 : 1;
    };

    const addWaypoint = useCallback((lat: number, lng: number, baseId?: number, name?: string, typeId?: number, groupId?: number) => {
        const type = typeId === undefined ? newWaypointType : typeId;
        const group = groupId === undefined ? newWaypointGroup : groupId;
        const waypointName = name === undefined ? newWaypointName : name;
        const newWaypoint: Waypoint = { id: getNextId(), lat, lng, baseId, typeId: type, groupId: group, name: waypointName };
        setWaypoints((prev) => [...prev, newWaypoint]);
    }, [newWaypointName, newWaypointType, newWaypointGroup, waypoints]);

    const selectWaypoint = (id: number) => {
        setSelectedId(id);
    };

    const deselectWaypoint = () => {
        setSelectedId(null);
    };

    const deleteWaypoint = (id: number) => {
        setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
        setSelectedId(null); // Clear selection after deletion
    };

    const toggleAddMode = () => {
        setAddMode((prev) => !prev);
    };

    const getWaypointById = (id: number): Waypoint | undefined => {
        return waypoints.find((wp) => wp.id === id);
    };

    const updateWaypointPosition = (id: number, lat: number, lng: number) => {
        setWaypoints((prev) => prev.map((wp) => (wp.id === id ? { ...wp, lat, lng } : wp)));
    };

    const updateWaypointName = (id: number, name: string) => {
        setWaypoints((prev) => prev.map((wp) => (wp.id === id ? { ...wp, name } : wp)));
    };

    const updateWaypointType = (id: number, typeId: number) => {
        setWaypoints((prev) => prev.map((wp) => (wp.id === id ? { ...wp, typeId } : wp)));
    };

    const updateWaypointGroup = (id: number, groupId?: number) => {
        setWaypoints((prev) => prev.map((wp) => (wp.id === id ? { ...wp, groupId } : wp)));
    };

    const isDeletable = (id: number) => {
        const waypoint = getWaypointById(id);
        if (!waypoint) return false;
        return !waypoints.some((wp) => wp.baseId === id);
    };

    const addRelativeWaypoint = (baseId: number, distance: number, bearing: number, name?: string, typeId?: number) => {
        const baseWaypoint = getWaypointById(baseId);
        if (baseWaypoint) {
            const newWaypoint = calculateRelativeWaypoint(baseWaypoint.lat, baseWaypoint.lng, distance, bearing);
            addWaypoint(newWaypoint.lat, newWaypoint.lng, baseId, name, typeId);
        }
    };

    return (
        <WaypointContext.Provider
            value={{
                waypoints,
                updateWaypointGroup,
                currentPosition,
                setCurrentPosition,
                selectedId,
                addWaypoint,
                selectWaypoint,
                deselectWaypoint,
                deleteWaypoint,
                setWaypoints,
                isDeletable,
                addMode,
                setAddMode,
                toggleAddMode,
                getWaypointById,
                updateWaypointPosition,
                updateWaypointName,
                addRelativeWaypoint,
                updateWaypointType,
                setNewWaypointName,
                setNewWaypointType,
                setNewWaypointGroup,
                newWaypointName,
                newWaypointType,
                newWaypointGroup,
            }}
        >
            {children}
        </WaypointContext.Provider>
    );
}

// Custom hook to use the context
export const useWaypointContext = (): WaypointContextType => {
    const context = useContext(WaypointContext);
    if (!context) {
        throw new Error("useWaypointContext must be used within a WaypointProvider");
    }
    return context;
};
