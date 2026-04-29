import React, { useCallback, useEffect } from "react";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { useWaypointTypeStore, WaypointType } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore, WaypointGroup } from "../../stores/useGroups";
import L from "leaflet";
import * as d3 from "d3";
import { useSettingsStore } from "../../stores/useSettings";
import { useMap } from "../../context/useMap";
import { renderLabel } from "../labels/renderLabel";

type WaypointLabelProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    waypointId: number;
    waypoint?: TWaypoint;
    type?: WaypointType;
    group?: WaypointGroup;
    radius?: number;
    labelColor?: string;
    showLabels?: boolean;
};

export const WaypointLabel = React.memo(({ g, waypointId, ...props }: WaypointLabelProps) => {
    const storeWaypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id === waypointId));
    const waypoint = props.waypoint ?? storeWaypoint;

    const map = useMap();

    const storeType = useWaypointTypeStore((state) => (waypoint ? state.getTypeById(waypoint.typeId) : undefined));
    const type = props.type ?? storeType;
    const storeGroup = useWaypointGroupStore((state) =>
        waypoint ? state.getWaypointGroupById(Number(waypoint.groupId ?? -1)) : undefined
    );
    const group = props.group ?? storeGroup;

    const storeShowLabels = useSettingsStore((state) => state.settings.showLabels);
    const storeWaypointRadius = useSettingsStore((state) => state.settings.waypointRadius);
    const storeLabelColor = useSettingsStore((state) => state.settings.labelColor);
    const waypointRadius = props.radius ?? type?.radiusOverride ?? storeWaypointRadius;
    const labelColor = props.labelColor ?? storeLabelColor;
    const showLabels = props.showLabels ?? storeShowLabels;

    const getLabelPosition = useCallback(() => {
        if (!g || !waypoint) return;
        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
        return { x: point.x + 4 + waypointRadius, y: point.y + 4 };
    }, [g, waypoint, map, waypointRadius]);

    useEffect(() => {
        if (!g || !waypoint || !type) return;
        if (!showLabels) return;

        const point = getLabelPosition();
        if (!point) return;

        const isHidden = type.hidden || group?.hidden;

        if (isHidden) {
            g.select(`#waypoint-label-${waypoint.id}`).remove();
            return;
        }

        const { id, name } = waypoint;

        const renderedLabel = renderLabel({
            g,
            x: point.x,
            y: point.y,
            text: id.toString() + (name ? ` (${name})` : ""),
            color: labelColor,
        });

        renderedLabel.attr("id", `waypoint-label-${id}`).classed("waypoint-label");

        return () => {
            renderedLabel.remove();
        };
    }, [waypoint, type, group, g, showLabels, map, labelColor, waypointRadius, getLabelPosition]);

    const updatePosition = useCallback(() => {
        if (!g || !waypoint) return;
        const point = getLabelPosition();
        if (!point) return;
        g.select(`#waypoint-label-${waypoint.id}`).attr("x", point.x).attr("y", point.y);
    }, [g, getLabelPosition, waypoint]);

    useEffect(() => {
        map.on("move zoom zoomanim", updatePosition);

        return () => {
            map.off("move zoom zoomanim", updatePosition);
        };
    }, [map, updatePosition]);

    return null;
}, areEqual);

function areEqual(prev: WaypointLabelProps, next: WaypointLabelProps) {
    return prev.waypointId === next.waypointId && prev.g === next.g;
}
