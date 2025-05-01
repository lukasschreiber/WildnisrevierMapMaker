import React, { useCallback, useEffect } from "react";
import { useWaypointStore } from "../../stores/useWaypoints";
import L from "leaflet";
import * as d3 from "d3";
import { useMap } from "react-leaflet";
import { useSettingsStore } from "../../stores/useSettings";
import { renderLabel } from "../renderLabel";
import { renderWaypointArrow } from "../renderWaypointArrow";
import { haversineDistance } from "../relativeWaypoints";

type WaypointArrowProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    waypointId: number;
};

export const WaypointArrow = React.memo(({ g, waypointId }: WaypointArrowProps) => {
    const waypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id === waypointId));
    const baseWaypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id === waypoint?.baseId));

    const map = useMap();

    const waypointRadius = useSettingsStore((state) => state.settings.waypointRadius);
    const labelColor = useSettingsStore((state) => state.settings.labelColor);
    const showWaypointLines = useSettingsStore((state) => state.settings.showWaypointLines);
    const showWaypointDistances = useSettingsStore((state) => state.settings.showWaypointDistances);
    const arrowColor = useSettingsStore((state) => state.settings.arrowColor);
    const arrowSize = useSettingsStore((state) => state.settings.arrowSize);
    const arrowWidth = useSettingsStore((state) => state.settings.arrowWidth);
    const arrowOpacity = useSettingsStore((state) => state.settings.arrowOpacity);

    const draw = useCallback(() => {
        if (!g || !waypoint || !baseWaypoint) return [];

        g.select(`#waypoint-arrow-${waypoint.id}`).remove();
        g.select(`#waypoint-distance-label-${waypoint.id}`).remove();

        const { lat, lng } = waypoint;

        const point = map.latLngToLayerPoint(new L.LatLng(lat, lng));

        const basePoint = map.latLngToLayerPoint(new L.LatLng(baseWaypoint.lat, baseWaypoint.lng));
        const dist = haversineDistance(lat, lng, baseWaypoint.lat, baseWaypoint.lng);

        const renderedComponents: d3.Selection<any, unknown, null, undefined>[] = [];

        if (showWaypointLines) {
            renderedComponents.push(
                renderWaypointArrow(
                    g,
                    point,
                    basePoint,
                    waypointRadius,
                    arrowColor,
                    arrowSize,
                    arrowWidth,
                    arrowOpacity
                ).attr("id", `waypoint-arrow-${waypoint.id}`)
            );
        }

        if (showWaypointDistances) {
            renderedComponents.push(
                renderLabel(
                    g,
                    (point.x + basePoint.x) / 2,
                    (point.y + basePoint.y) / 2 - 5,
                    `${dist.toFixed(2)} m`,
                    "distance-label",
                    labelColor
                ).attr("id", `waypoint-distance-label-${waypoint.id}`)
            );
        }

        return renderedComponents;
    }, [
        waypoint,
        g,
        map,
        labelColor,
        waypointRadius,
        baseWaypoint,
        showWaypointLines,
        showWaypointDistances,
        arrowColor,
        arrowSize,
        arrowWidth,
        arrowOpacity,
    ]);

    useEffect(() => {
        draw();
    }, [draw]);

    const updatePosition = useCallback(() => {
        draw();
    }, [g, draw]);

    useEffect(() => {
        map.on("zoomend", updatePosition);
        map.on("moveend", updatePosition);

        return () => {
            map.off("zoomend", updatePosition);
            map.off("moveend", updatePosition);
        };
    }, [map, updatePosition]);

    return null;
}, areEqual);

function areEqual(prev: WaypointArrowProps, next: WaypointArrowProps) {
    return prev.waypointId === next.waypointId && prev.g === next.g;
}
