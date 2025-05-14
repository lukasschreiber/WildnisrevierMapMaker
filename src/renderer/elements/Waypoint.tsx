import React, { useCallback, useEffect } from "react";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { useWaypointTypeStore, WaypointType } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore, WaypointGroup } from "../../stores/useGroups";
import { renderMarker } from "../renderMarkers";
import L from "leaflet";
import * as d3 from "d3";
import { useMap } from "../../context/MapContext";
import { useSettingsStore } from "../../stores/useSettings";
import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";

type WaypointProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    waypointId: number;
    waypoint?: TWaypoint
    type?: WaypointType
    group?: WaypointGroup
};

export const Waypoint = React.memo(({ g, waypointId, ...props }: WaypointProps) => {
    const waypoint = props.waypoint ?? useWaypointStore((state) => state.waypoints.find((wp) => wp.id === waypointId));
    const selectedId = useWaypointStore((state) => state.selectedId);
    const isSelected = selectedId === waypoint?.id;

    const map = useMap();

    const type = props.type ?? useWaypointTypeStore((state) => (waypoint ? state.getTypeById(waypoint.typeId) : undefined));
    const group = props.group ?? useWaypointGroupStore((state) =>
        waypoint ? state.getWaypointGroupById(Number(waypoint.groupId) ?? -1) : undefined
    );

    const waypointRadius = useSettingsStore((state) => state.settings.waypointRadius);
    const waypointBorderColor = useSettingsStore((state) => state.settings.waypointBorderColor);
    const showWaypointBorder = useSettingsStore((state) => state.settings.showWaypointBorder);
    const waypointBorderWidth = useSettingsStore((state) => state.settings.waypointBorderWidth);

    const addPathMode = usePathStore((state) => state.addMode);
    const addShapeMode = useShapeStore((state) => state.addMode);
    const addShapeNode = useShapeStore((state) => state.addNode);
    const addModeReferenceShapeId = useShapeStore((state) => state.addModeReferenceShapeId);
    const segmentConnectionStarted = usePathStore((state) => state.segmentConnectionStarted);
    const endSegmentConnection = usePathStore((state) => state.endSegmentConnection);
    const startSegmentConnection = usePathStore((state) => state.startSegmentConnection);

    const selectWaypoint = useWaypointStore((state) => state.selectWaypoint);

    useEffect(() => {
        if (!g || !waypoint || !type) return;
        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));

        const renderedMarker = renderMarker(
            g,
            point,
            selectedId === waypoint.id,
            type.radiusOverride ? type.radiusOverride : waypointRadius,
            type,
            group,
            waypointBorderWidth,
            waypointBorderColor,
            showWaypointBorder
        ).on("click", (event: MouseEvent) => {
            event.stopPropagation();
            if (addPathMode) {
                if (segmentConnectionStarted) {
                    endSegmentConnection(waypoint.id);
                } else {
                    startSegmentConnection(waypoint.id);
                }
            } else if (addShapeMode) {
                if (addModeReferenceShapeId) {
                    addShapeNode(addModeReferenceShapeId, waypoint.id);
                }
            } else {
                selectWaypoint(waypoint.id);
                if (waypoint) {
                    const { lat, lng } = waypoint;
                    map.setView([lat, lng], map.getZoom());
                }
            }
        });

        renderedMarker.attr("id", `waypoint-${waypoint.id}`).classed("waypoint");

        return () => {
            renderedMarker.remove();
        };
    }, [
        waypoint,
        type,
        group,
        g,
        isSelected,
        waypointRadius,
        waypointBorderWidth,
        waypointBorderColor,
        showWaypointBorder,
        addPathMode,
        addShapeMode,
        map,
        segmentConnectionStarted,
        endSegmentConnection,
        startSegmentConnection,
        selectWaypoint,
        addModeReferenceShapeId,
        addShapeNode,
    ]);

    const updatePosition = useCallback(() => {
        if (!g || !waypoint) return;
        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
        g.select(`#waypoint-${waypoint.id}`).attr("transform", `translate(${point.x}, ${point.y})`);
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

function areEqual(prev: WaypointProps, next: WaypointProps) {
    return prev.waypointId === next.waypointId && prev.g === next.g;
}
