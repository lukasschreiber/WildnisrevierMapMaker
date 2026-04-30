import React from "react";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { Waypoint } from "../elements/Waypoint";
import { WaypointLabel } from "../elements/WaypointLabel";
import { WaypointType } from "../../stores/useWaypointTypes";
import { WaypointGroup } from "../../stores/useGroups";
import { useLayer } from "../../context/useLayer";

export function WaypointLayer(props: {
    waypoints?: TWaypoint[];
    types?: Record<number, WaypointType>;
    groups?: WaypointGroup[];
    borderWidth?: number;
    radius?: number;
    borderColor?: string;
    showBorder?: boolean;
    visualizeHiddenItems?: boolean;
    disableSelection?: boolean;
    showLabels?: boolean;
    labelColor?: string;
    highlightType?: boolean;
}) {
    const g = useLayer(12);
    const labelG = useLayer(13)
    const waypointsFromStore = useWaypointStore((state) => state.waypoints);
    const waypoints = props.waypoints ?? waypointsFromStore;

    if (!g) return null; // Ensure g is defined before proceeding

    return waypoints.map((waypoint) => {
        const group = props.groups?.find((g) => Number(waypoint.groupId) === Number(g.id));
        const type = Object.values(props.types ?? []).find((t) => Number(waypoint.typeId) === Number(t.id));
        return (
            <React.Fragment key={waypoint.id}>
                <Waypoint
                    g={g}
                    waypointId={waypoint.id}
                    waypoint={props.waypoints && waypoint}
                    type={type}
                    group={group}
                    borderWidth={props.borderWidth}
                    radius={props.radius}
                    borderColor={props.borderColor}
                    showBorder={props.showBorder}
                    visualizeHiddenItems={props.visualizeHiddenItems}
                    disableSelection={props.disableSelection}
                    highlightType={props.highlightType}
                />
                <WaypointLabel
                    g={labelG}
                    waypointId={waypoint.id}
                    waypoint={props.waypoints && waypoint}
                    type={type}
                    group={group}
                    radius={props.radius}
                    showLabels={props.showLabels}
                    labelColor={props.labelColor}
                />
            </React.Fragment>
        );
    });
}
