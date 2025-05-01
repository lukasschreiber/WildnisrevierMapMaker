import React, { useMemo } from "react";
import { useLayer } from "../../context/LayerContext";
import { useWaypointStore } from "../../stores/useWaypoints";
import { WaypointArrow } from "../elements/WaypointArrow";

export function WaypointArrowLayer() {
    const g = useLayer(11);
    const waypoints = useWaypointStore((state) => state.waypoints);
    const relativeWaypoints = useMemo(() => waypoints.filter((wp) => wp.baseId !== undefined), [waypoints]);

    return relativeWaypoints.map((waypoint) => (
        <React.Fragment key={waypoint.id}>
            <WaypointArrow g={g} waypointId={waypoint.id} />
        </React.Fragment>
    ));
}
