import { useMemo, useState } from "react";
import { useWaypointContext } from "../context/WaypointContext";
import { useWaypointTypeContext } from "../context/WaypointTypeContext";
import { usePathContext } from "../context/PathContext";

export function WaypointInfo(props: { id: number }) {
    const { getWaypointById, deleteWaypoint, deselectWaypoint, addRelativeWaypoint, isDeletable, updateWaypointName, updateWaypointType } =
        useWaypointContext();
        const { deleteSegment, segments } = usePathContext();
    const { waypointTypes } = useWaypointTypeContext();
    const [distance, setDistance] = useState(1);
    const [bearing, setBearing] = useState(0);
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
            <input
                className="w-full bg-black/20 p-1 rounded-md"
                placeholder="Name"
                value={waypoint.name || ""}
                onChange={(e) => updateWaypointName(waypoint.id, e.target.value)}
            />
            <select
                className="w-full bg-black/20 p-1 rounded-md"
                value={waypoint.typeId}
                onChange={(e) => updateWaypointType(waypoint.id, parseInt(e.target.value))}
            >
                {waypointTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                        {type.name}
                    </option>
                ))}
            </select>
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

            <div className="flex gap-2 flex-row">
                <div className="w-1/2">Distance (m)</div>
                <div className="w-1/2">Bearing (°)</div>
            </div>
            <div className="flex gap-2 flex-row">
                <input
                    type="number"
                    className="w-1/2 bg-black/20 p-1 rounded-md"
                    placeholder="Distance (m)"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value))}
                />
                <input
                    type="number"
                    className="w-1/2 bg-black/20 p-1 rounded-md"
                    placeholder="Bearing (°)"
                    defaultValue={bearing}
                    onChange={(e) => setBearing(parseFloat(e.target.value))}
                />
            </div>
            <button
                onClick={() => {
                    addRelativeWaypoint(waypoint.id, distance, bearing);
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Relative Waypoint
            </button>
        </div>
    );
}
