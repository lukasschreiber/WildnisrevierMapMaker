import { useMap } from "../context/MapContext";
import { SegmentInfo } from "./SegmentInfo";
import { WaypointInfo } from "./WaypointInfo";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { Select } from "./inputs/Select";
import { TextInput } from "./inputs/TextInput";
import { Checkbox } from "./inputs/Checkbox";
import { useWaypointTypeStore } from "../stores/useWaypointTypes";
import { useWaypointStore } from "../stores/useWaypoints";
import { usePathStore } from "../stores/usePaths";
import { useWaypointGroupStore } from "../stores/useGroups";
import { useInteractionModeStore } from "../stores/useInteractionMode";

export function Menu(props: { showSidePanel: boolean; setShowSidePanel: (show: boolean) => void }) {
    const selectedId = useWaypointStore((state) => state.selectedId);
    const setCurrentPosition = useWaypointStore((state) => state.setCurrentPosition);
    const currentPosition = useWaypointStore((state) => state.currentPosition);
    const newWaypointGroup = useWaypointStore((state) => state.newWaypointGroup);
    const newWaypointName = useWaypointStore((state) => state.newWaypointName);
    const newWaypointType = useWaypointStore((state) => state.newWaypointType);
    const setNewWaypointGroup = useWaypointStore((state) => state.setNewWaypointGroup);
    const setNewWaypointName = useWaypointStore((state) => state.setNewWaypointName);
    const setNewWaypointType = useWaypointStore((state) => state.setNewWaypointType);

    const selectedSegmentId = usePathStore((state) => state.selectedSegmentId);

    const waypointGroups = useWaypointGroupStore((state) => state.waypointGroups);

    const types = useWaypointTypeStore((state) => state.types);
    const mode = useInteractionModeStore((state) => state.mode);
    const activateSelect = useInteractionModeStore((state) => state.activateSelect);
    const activateWaypointAdd = useInteractionModeStore((state) => state.activateWaypointAdd);
    const containerRef = useRef<HTMLDivElement>(null);
    const map = useMap();

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
        }
    }, [containerRef.current]);

    return (
        <div
            ref={containerRef}
            className="absolute top-0 left-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3"
            id="menu"
        >
            {!selectedId && !selectedSegmentId && <div className="text-xs">No Waypoint or Segment Selected</div>}
            {selectedId ? <WaypointInfo id={selectedId} /> : null}
            {selectedSegmentId ? <SegmentInfo id={selectedSegmentId} /> : null}
            <hr className="my-2 border-black opacity-40" />
            <div>
                <div className="text-xs mb-1">Mode:</div>
                <Select
                    className="w-full"
                    value={mode === "waypoint-add" ? "add" : "normal"}
                    onChange={(value) => {
                        if (value === "add") {
                            activateWaypointAdd();
                        } else {
                            activateSelect();
                        }
                    }}
                    options={[{ label: "Normal", value: "normal" }, { label: "Add Waypoint", value: "add" }]}
                />
            </div>
            {mode === "waypoint-add" && (
                <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs">Add Waypoint</span>
                    <TextInput
                        className="w-full"
                        placeholder="Enter Waypoint Name"
                        value={newWaypointName}
                        onChange={(value) => setNewWaypointName(value)}
                    />
                    <Select
                        className="w-full"
                        value={newWaypointType}
                        onChange={(value) => setNewWaypointType(value)}
                        options={Object.values(types).map((type) => ({
                            label: type.name,
                            value: type.id,
                        }))}
                    />
                    <Select
                        className="w-full"
                        value={newWaypointGroup ?? ""}
                        onChange={(value) => {
                            const groupId =value === "" ? undefined : value;
                            setNewWaypointGroup(groupId);
                        }}
                        options={[{ label: "No Group", value: "" }, ...waypointGroups.map((group) => ({ label: group.name, value: group.id }))]}
                    />
                </div>
            )}
            <div>
                <div className="flex flex-row justify-between gap-2">
                    <span>Add Waypoint Mode</span>
                    <span className={`text-xs ${mode === "waypoint-add" ? "text-green-500" : "text-red-500"}`}>
                        {mode === "waypoint-add" ? "ON" : "OFF"}
                    </span>
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <span>Add Path Mode</span>
                    <span className={`text-xs ${mode === "path-edit" ? "text-green-500" : "text-red-500"}`}>
                        {mode === "path-edit" ? "ON" : "OFF"}
                    </span>
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <span>Add Shape Mode</span>
                    <span className={`text-xs ${mode === "shape-edit" ? "text-green-500" : "text-red-500"}`}>
                        {mode === "shape-edit" ? "ON" : "OFF"}
                    </span>
                </div>
            </div>
            <hr className="my-2 border-black opacity-40" />
            <Checkbox 
                label="Show Side Panel"
                value={props.showSidePanel}
                onChange={(value) => props.setShowSidePanel(value)}
            />
            <hr className="my-2 border-black opacity-40" />
            <div className="flex flex-col gap-1">
                <button
                    className="bg-black/50 p-1 rounded-md cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => {
                        setCurrentPosition(null);
                        map.locate({ enableHighAccuracy: true }).on("locationfound", function (e) {
                            setCurrentPosition(e.latlng);
                            map.flyTo(e.latlng, map.getZoom());
                        });
                    }}
                >
                    Locate Me
                </button>
                {currentPosition && (
                    <button
                        className="bg-black/50 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={() => {
                            map.flyTo(currentPosition, map.getZoom());
                        }}
                    >
                        Center Map
                    </button>
                )}
                {currentPosition && (
                    <button
                        className="bg-black/50 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={() => {
                            setCurrentPosition(null);
                        }}
                    >
                        Clear Location
                    </button>
                )}
            </div>
        </div>
    );
}
