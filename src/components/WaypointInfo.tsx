import { useMemo, useState } from "react";
import { useWaypointContext } from "../context/WaypointContext";
import { useWaypointTypeContext } from "../context/WaypointTypeContext";
import { usePathContext } from "../context/PathContext";
import { useWaypointGroupContext } from "../context/WaypointGroupContext";
import { Select } from "./inputs/Select";
import { TextInput } from "./inputs/TextInput";
import { NumberInput } from "./inputs/NumberInput";

export function WaypointInfo(props: { id: number }) {
    const {
        getWaypointById,
        deleteWaypoint,
        deselectWaypoint,
        addRelativeWaypoint,
        isDeletable,
        updateWaypointName,
        updateWaypointType,
        updateWaypointGroup,
    } = useWaypointContext();
    const { deleteSegment, segments } = usePathContext();
    const { waypointTypes } = useWaypointTypeContext();
    const { waypointGroups } = useWaypointGroupContext();
    const [distance, setDistance] = useState(1);
    const [bearing, setBearing] = useState(0);
    const [newTypeId, setNewTypeId] = useState(0);
    const [newName, setNewName] = useState<string | null>(null);
    const waypoint = useMemo(() => getWaypointById(props.id), [props.id, getWaypointById]);

    if (!waypoint) {
        return null;
    }

    return (
        <div className="gap-2 flex flex-col">
            <h2 className="text-xs">Selected Waypoint</h2>
            <p>ID: {waypoint.id}</p>
            <p>Latitude: {waypoint.lat}</p>
            <p>Longitude: {waypoint.lng}</p>
            <TextInput
                className="w-full"
                placeholder="Name"
                value={waypoint.name || ""}
                onChange={(value) => updateWaypointName(waypoint.id, value)}
            />
            <Select
                className="w-full"
                value={waypoint.typeId}
                onChange={(value) => updateWaypointType(waypoint.id, value)}
                options={waypointTypes.map((type) => ({
                    label: type.name,
                    value: type.id,
                }))}
            />
            <Select
                className="w-full"
                value={waypoint.groupId ?? ""}
                onChange={(value) => {
                    const groupId = value === "" ? undefined : value;
                    updateWaypointGroup(waypoint.id, groupId);
                }}
                options={[
                    { label: "No Group", value: "" },
                    ...waypointGroups.map((group) => ({ label: group.name, value: group.id })),
                ]}
            />
            <button
                onClick={() => {
                    if (confirm("Are you sure you want to delete this waypoint?")) {
                        // Delete all segments connected to this waypoint
                        segments.forEach((segment) => {
                            if (segment.from.waypointId === waypoint.id || segment.to.waypointId === waypoint.id) {
                                deleteSegment(segment.id);
                            }
                        });
                        deleteWaypoint(waypoint.id);

                        deselectWaypoint();
                    }
                }}
                disabled={!isDeletable(waypoint.id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-red-500"
            >
                Delete Waypoint
            </button>

            <hr className="my-2 border-black opacity-40" />
            <TextInput
                className="w-full"
                placeholder="Name"
                value={newName || ""}
                onChange={(value) => setNewName(value)}
            />
            <Select
                className="w-full"
                value={newTypeId}
                onChange={(value) => setNewTypeId(value)}
                options={waypointTypes.map((type) => ({ label: type.name, value: type.id }))}
            />
            <div className="flex gap-2 flex-row">
                <div className="w-1/2">Distance (m)</div>
                <div className="w-1/2">Bearing (°)</div>
            </div>
            <div className="flex gap-2 flex-row">
                <NumberInput
                    className="w-1/2"
                    placeholder="Distance (m)"
                    value={distance}
                    onChange={(value) => setDistance(value)}
                />
                <NumberInput
                    className="w-1/2"
                    placeholder="Bearing (°)"
                    value={bearing}
                    onChange={(value) => setBearing(value)}
                />
            </div>
            <button
                onClick={() => {
                    addRelativeWaypoint(waypoint.id, distance, bearing, newName ?? undefined, newTypeId);
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Relative Waypoint
            </button>
        </div>
    );
}
