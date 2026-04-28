import React, { useCallback, useEffect } from "react";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { useWaypointTypeStore, WaypointType } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore, WaypointGroup } from "../../stores/useGroups";
import { renderMarker } from "../renderMarkers";
import L from "leaflet";
import * as d3 from "d3";
import { useMap, useMapContext } from "../../context/MapContext";
import { useSettingsStore } from "../../stores/useSettings";
import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";
import { evaluationEventEmitter } from "../../utils/evaluation";

type WaypointProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    waypointId: number;
    waypoint?: TWaypoint;
    type?: WaypointType;
    group?: WaypointGroup;
    borderWidth?: number;
    radius?: number;
    borderColor?: string;
    showBorder?: boolean;
    visualizeHiddenItems?: boolean;
    disableSelection?: boolean;
    highlightType?: boolean;
};

export const Waypoint = React.memo(({ g, waypointId, ...props }: WaypointProps) => {
    const storeWaypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id === waypointId));
    const waypoint = props.waypoint ?? storeWaypoint;

    const { selectedWaypoint, setSelectedWaypoint } = useMapContext();
    const selectedId = useWaypointStore((state) => state.selectedId);
    const isSelected = selectedId === waypoint?.id;

    const map = useMap();

    const storeType = useWaypointTypeStore((state) => (waypoint ? state.getTypeById(waypoint.typeId) : undefined));
    const type = props.type ?? storeType;
    const storeGroup = useWaypointGroupStore((state) =>
        waypoint ? state.getWaypointGroupById(Number(waypoint.groupId ?? -1)) : undefined
    );
    const group = props.group ?? storeGroup;

    const storeWaypointRadius = useSettingsStore((state) => state.settings.waypointRadius);
    const waypointRadius = props.radius ?? storeWaypointRadius;
    const storeWaypointBorderColor = useSettingsStore((state) => state.settings.waypointBorderColor);
    const waypointBorderColor = props.borderColor ?? storeWaypointBorderColor;
    const storeShowWaypointBorder = useSettingsStore((state) => state.settings.showWaypointBorder);
    const showWaypointBorder = props.showBorder ?? storeShowWaypointBorder;
    const storeWaypointBorderWidth = useSettingsStore((state) => state.settings.waypointBorderWidth);
    const waypointBorderWidth = props.borderWidth ?? storeWaypointBorderWidth;

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
            waypoint?.additionalText,
            waypoint?.hidden ?? false,
            selectedId === waypoint.id,
            type.radiusOverride ? type.radiusOverride : waypointRadius,
            type,
            group,
            waypointBorderWidth,
            waypointBorderColor,
            showWaypointBorder,
            props.visualizeHiddenItems ?? true
        );

        if (props.highlightType) {
            renderedMarker.on("click", (e) => {
                e.stopPropagation(); // This will stop the second click event from firing TODO: not clean
                setSelectedWaypoint(waypoint);
                evaluationEventEmitter.emit({
                    name: "labelSelect",
                    timestamp: new Date(),
                    url: window.location.href,
                    details: {
                        waypointId: waypoint.id,
                        action: "labelSelect",
                    },
                })
            });

            if (selectedWaypoint && selectedWaypoint.typeId !== waypoint.typeId) {
                renderedMarker.attr("opacity", 0.25);
            }
        }

        if (!props.disableSelection) {
            renderedMarker.on("click", (event: MouseEvent) => {
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
        }

        renderedMarker.attr("id", `waypoint-${waypoint.id}`).classed("waypoint");

        return () => {
            renderedMarker.remove();
        };
    }, [waypoint, type, group, g, isSelected, waypointRadius, waypointBorderWidth, waypointBorderColor, showWaypointBorder, addPathMode, addShapeMode, map, segmentConnectionStarted, endSegmentConnection, startSegmentConnection, selectWaypoint, addModeReferenceShapeId, addShapeNode, selectedWaypoint, props.disableSelection, props.visualizeHiddenItems, props.highlightType, selectedId, setSelectedWaypoint]);

    const updatePosition = useCallback(() => {
        if (!g || !waypoint) return;

        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
        const group = g.select(`#waypoint-${waypoint.id}`);

        let xOffset = 0;
        let yOffset = 0;

        // Check all children for offset attributes
        group.selectAll("*").each(function () {
            const el = d3.select(this);
            const x = Number(el.attr("icon-offset-x")) || 0;
            const y = Number(el.attr("icon-offset-y")) || 0;
            if (x !== 0 || y !== 0) {
                xOffset = x;
                yOffset = y;
            }
        });

        group.attr("transform", `translate(${point.x - xOffset}, ${point.y - yOffset})`);
    }, [g, map, waypoint]);

    useEffect(() => {
        map.on("move zoom zoomanim", updatePosition);

        return () => {
            map.off("move zoom zoomanim", updatePosition);
        };
    }, [map, g, waypoint, updatePosition]);

    return null;
}, areEqual);

function areEqual(prev: WaypointProps, next: WaypointProps) {
    return prev.waypointId === next.waypointId && prev.g === next.g;
}
