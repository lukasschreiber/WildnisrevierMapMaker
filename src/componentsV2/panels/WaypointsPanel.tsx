import { useNavigate, useSearchParams } from "react-router";
import { LegendWaypointMarker } from "../../components/legend/LegendWaypointMarker";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { Panel } from "../MainPanel";

export function WaypointsPanel() {
    const waypoints = useWaypointStore((state) => state.waypoints);
    const types = useWaypointTypeStore((state) => state.types);
    const selectedId = useWaypointStore((state) => state.selectedId);
    const navigate = useNavigate();

    return (
        <Panel title="Waypoints">
            {waypoints.map((waypoint) => (
                <div
                    key={waypoint.id}
                    className={`flex px-2 mx-2 hover:bg-gray-100 rounded-md py-2 items-center gap-2 text-sm cursor-pointer ${selectedId === waypoint.id ? "bg-gray-200" : ""}`}
                    onClick={() => {
                        navigate(`/waypoint/${waypoint.id}`);
                    }}
                >
                    <LegendWaypointMarker
                        type={types[waypoint.typeId]}
                        radius={8}
                        borderWidth={1}
                        borderColor="black"
                    />
                    <span>{waypoint.id}</span>
                    {waypoint.name ? ` (${waypoint.name})` : ""}{" "}
                    {waypoint.additionalText ? `- ${waypoint.additionalText}` : ""}
                </div>
            ))}
        </Panel>
    );
}
