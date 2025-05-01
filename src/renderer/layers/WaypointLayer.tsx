import React from "react";
import { useLayer } from "../../context/LayerContext";
import { useWaypointStore } from "../../stores/useWaypoints";
import { Waypoint } from "../elements/Waypoint";
import { WaypointLabel } from "../elements/WaypointLabel";

export function WaypointLayer() {
    const g = useLayer(12);
    const waypoints = useWaypointStore((state) => state.waypoints);

    return waypoints.map((waypoint) => (
        <React.Fragment key={waypoint.id}>
            <Waypoint g={g} waypointId={waypoint.id} />
            <WaypointLabel g={g} waypointId={waypoint.id} />
        </React.Fragment>
    ));
}
