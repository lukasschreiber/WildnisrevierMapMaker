import React, { useCallback, useEffect } from "react";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { useWaypointTypeStore, WaypointType } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore, WaypointGroup } from "../../stores/useGroups";
import L from "leaflet";
import * as d3 from "d3";
import { useSettingsStore } from "../../stores/useSettings";
import { usePathStore } from "../../stores/usePaths";
import { evaluationEventEmitter } from "../../utils/evaluation";
import { useInteractionModeStore } from "../../stores/useInteractionMode";
import { pathActions } from "../../domain/actions/paths";
import { shapeActions } from "../../domain/actions/shapes";
import { useMapContext } from "../../context/useMap";
import { renderMarker } from "../markers/renderMarker";

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

    const { selectedWaypoint, setSelectedWaypoint, map } = useMapContext();
    const selectedId = useWaypointStore((state) => state.selectedId);
    const isSelected = selectedId === waypoint?.id;

    const storeType = useWaypointTypeStore((state) => (waypoint ? state.getTypeById(waypoint.typeId) : undefined));
    const type = props.type ?? storeType;
    const storeGroup = useWaypointGroupStore((state) =>
        waypoint ? state.getWaypointGroupById(Number(waypoint.groupId ?? -1)) : undefined,
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

    const mode = useInteractionModeStore((state) => state.mode);
    const activePathId = useInteractionModeStore((state) => state.activePathId);
    const activeShapeId = useInteractionModeStore((state) => state.activeShapeId);
    const segmentConnectionStarted = usePathStore((state) => state.segmentConnectionStarted);
    const startSegmentConnection = usePathStore((state) => state.startSegmentConnection);
    const cancelSegmentConnection = usePathStore((state) => state.cancelSegmentConnection);
    const connectionStartedWaypointId = usePathStore((state) => state.connectionStartedWaypointId);

    const selectWaypoint = useWaypointStore((state) => state.selectWaypoint);

    useEffect(() => {
        if (!g || !waypoint || !type) return;
        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
        const renderedMarker = renderMarker({
            g,
            point,
            additionalText: waypoint?.additionalText,
            hidden: waypoint?.hidden ?? false,
            isSelected: selectedId === waypoint.id,
            radius: type.radiusOverride ? type.radiusOverride : waypointRadius,
            type,
            group,
            borderWidth: waypointBorderWidth,
            borderColor: waypointBorderColor,
            showBorder: showWaypointBorder,
            visualizeHiddenItems: props.visualizeHiddenItems ?? true,
        });

        if (props.highlightType) {
            renderedMarker.on("click", (e: Event) => {
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
                });
            });

            if (selectedWaypoint && selectedWaypoint.typeId !== waypoint.typeId) {
                renderedMarker.attr("opacity", 0.25);
            }
        }

        if (!props.disableSelection) {
            renderedMarker.on("click", (event: MouseEvent) => {
                event.stopPropagation();
                if (mode === "path-edit") {
                    if (activePathId === null) {
                        return;
                    }

                    if (segmentConnectionStarted) {
                        if (connectionStartedWaypointId !== null && connectionStartedWaypointId !== waypoint.id) {
                            pathActions.addSegment(
                                activePathId,
                                { waypointId: connectionStartedWaypointId },
                                { waypointId: waypoint.id },
                            );
                        }
                        cancelSegmentConnection();
                    } else {
                        startSegmentConnection(waypoint.id);
                    }
                } else if (mode === "shape-edit") {
                    if (activeShapeId !== null) {
                        shapeActions.addNode(activeShapeId, waypoint.id);
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
        mode,
        map,
        segmentConnectionStarted,
        connectionStartedWaypointId,
        startSegmentConnection,
        cancelSegmentConnection,
        activePathId,
        activeShapeId,
        selectWaypoint,
        selectedWaypoint,
        props.disableSelection,
        props.visualizeHiddenItems,
        props.highlightType,
        selectedId,
        setSelectedWaypoint,
    ]);

    const updatePosition = useCallback(() => {
        if (!g || !waypoint) return;

        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
        const group = g.select(`#waypoint-${waypoint.id}`);

        let xOffset = 0;
        let yOffset = 0;

        group.selectAll("*").each(function () {
            const el = d3.select(this);
            const x = Number(el.attr("icon-offset-x")) || 0;
            const y = Number(el.attr("icon-offset-y")) || 0;
            if (x !== 0 || y !== 0) {
                xOffset = x;
                yOffset = y;
            }
        });

        const existingTransform = group.attr("transform") ?? "";

        const transformWithoutTranslate = existingTransform.replace(/translate\([^)]*\)/g, "").trim();

        group.attr(
            "transform",
            `translate(${point.x - xOffset}, ${point.y - yOffset}) ${transformWithoutTranslate}`.trim(),
        );
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
