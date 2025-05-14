import React from "react";
import { useLayer } from "../../context/LayerContext";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { Waypoint } from "../elements/Waypoint";
import { WaypointLabel } from "../elements/WaypointLabel";
import { WaypointType } from "../../stores/useWaypointTypes";
import { WaypointGroup } from "../../stores/useGroups";

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
}) {
    const g = useLayer(12);
    const waypoints = props.waypoints ?? useWaypointStore((state) => state.waypoints);

    if (!g) return null; // Ensure g is defined before proceeding

    return waypoints.map((waypoint) => {
        const group = props.groups?.find((g) => waypoint.groupId === g.id);
        const type = Object.values(props.types ?? []).find((t) => waypoint.typeId === t.id);
        return (
            <React.Fragment key={waypoint.id}>
                <Waypoint
                    g={g}
                    waypointId={waypoint.id}
                    waypoint={waypoint}
                    type={type}
                    group={group}
                    borderWidth={props.borderWidth}
                    radius={props.radius}
                    borderColor={props.borderColor}
                    showBorder={props.showBorder}
                    visualizeHiddenItems={props.visualizeHiddenItems}
                    disableSelection={props.disableSelection}
                />
                <WaypointLabel
                    g={g}
                    waypointId={waypoint.id}
                    waypoint={waypoint}
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
