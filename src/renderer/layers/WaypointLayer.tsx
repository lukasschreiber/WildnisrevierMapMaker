import React from "react";
import { useLayer } from "../../context/LayerContext";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { Waypoint } from "../elements/Waypoint";
import { WaypointLabel } from "../elements/WaypointLabel";
import { WaypointType } from "../../stores/useWaypointTypes";
import { WaypointGroup } from "../../stores/useGroups";

export function WaypointLayer(props: { waypoints?: TWaypoint[]; types?: Record<number, WaypointType>; groups?: WaypointGroup[] }) {
    const g = useLayer(12);
    const waypoints = props.waypoints ?? useWaypointStore((state) => state.waypoints);

    if (!g) return null; // Ensure g is defined before proceeding

    return waypoints.map((waypoint) => (
        <React.Fragment key={waypoint.id}>
            <Waypoint
                g={g}
                waypointId={waypoint.id}
                waypoint={waypoint}
                type={Object.values(props.types ?? [])?.find((t) => waypoint.typeId === t.id)}
                group={props.groups?.find((g) => waypoint.groupId === g.id)}
            />
            <WaypointLabel g={g} waypointId={waypoint.id} />
        </React.Fragment>
    ));
}
