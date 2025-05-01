import React, { useCallback, useEffect } from "react";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore } from "../../stores/useGroups";
import L from "leaflet";
import * as d3 from "d3";
import { useMap } from "react-leaflet";
import { useSettingsStore } from "../../stores/useSettings";
import { renderLabel } from "../renderLabel";

type WaypointLabelProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    waypointId: number;
};

export const WaypointLabel = React.memo(({ g, waypointId }: WaypointLabelProps) => {
    const waypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id === waypointId));

    const map = useMap();

    const type = useWaypointTypeStore((state) => (waypoint ? state.getTypeById(waypoint.typeId) : undefined));
    const group = useWaypointGroupStore((state) =>
        waypoint ? state.getWaypointGroupById(waypoint.groupId ?? -1) : undefined
    );

    const showLabels = useSettingsStore((state) => state.settings.showLabels);
    const waypointRadius = useSettingsStore((state) => state.settings.waypointRadius);
    const labelColor = useSettingsStore((state) => state.settings.labelColor);

    useEffect(() => {
        if (!g || !waypoint || !type) return;
        if (!showLabels) return;

        const point = getLabelPosition();
        if (!point) return;

        const { id, name } = waypoint;

        const renderedLabel = renderLabel(
            g,
            point.x,
            point.y,
            id.toString() + (name ? ` (${name})` : ""),
            undefined,
            labelColor
        );

        renderedLabel.attr("id", `waypoint-label-${id}`).classed("waypoint-label");

        return () => {
            renderedLabel.remove();
        };
    }, [waypoint, type, group, g, showLabels, map, labelColor, waypointRadius]);

    const getLabelPosition = useCallback(() => {
        if (!g || !waypoint) return;
        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
        return { x: point.x + 4 + waypointRadius, y: point.y + 4 };
    }, [waypointId, g, waypoint, map, waypointRadius]);

    const updatePosition = useCallback(() => {
        if (!g || !waypoint) return;
        const point = getLabelPosition();
        if (!point) return;
        g.select(`#waypoint-label-${waypoint.id}`).attr("x", point.x).attr("y", point.y);
    }, [g, waypoint]);

    useEffect(() => {
        map.on("zoomend", updatePosition);
        map.on("moveend", updatePosition);

        return () => {
            map.off("zoomend", updatePosition);
            map.off("moveend", updatePosition);
        };
    }, [map, g, waypoint]);

    return null;
}, areEqual);

function areEqual(prev: WaypointLabelProps, next: WaypointLabelProps) {
    return prev.waypointId === next.waypointId && prev.g === next.g;
}
