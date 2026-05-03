import React, { useCallback, useEffect, useMemo } from "react";
import { useWaypointStore, Waypoint as TWaypoint } from "../../stores/useWaypoints";
import { useWaypointTypeStore, WaypointType } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore, WaypointGroup } from "../../stores/useGroups";
import L from "leaflet";
import * as d3 from "d3";
import { useSettingsStore } from "../../stores/useSettings";
import { evaluationEventEmitter } from "../../utils/evaluation";
import { useInteractionsStore } from "../../stores/useInteractions";
import { useMapContext } from "../../context/useMap";
import { renderMarker } from "../markers/renderMarker";
import { renderBearingDistanceVisual } from "../markers/renderBearingDistanceVisual";
import { WaypointOverlayControl } from "../../components/WaypointOverlayControl";
import { useSelectionActions } from "../../hooks/useSelectionActions";

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
    const { selectEntity, selectEntities } = useSelectionActions();

    const mode = useInteractionsStore((state) => state.mode);
    const selectedWaypointIds = useInteractionsStore((state) => state.selectedWaypointIds);
    const isWaypointSelected = useInteractionsStore((state) =>
        waypoint ? state.isSelected("waypoint", waypoint.id) : false,
    );

    const relativeWaypoint = useInteractionsStore((state) => state.relativeWaypoint);
    const isRelativeWaypointStart = useMemo(
        () => waypoint && relativeWaypoint.startWaypointId === waypoint.id,
        [waypoint, relativeWaypoint],
    );

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

    const connectionStartedWaypointId = useInteractionsStore((state) => state.pathEdit.connectionStartedWaypointId);
    const startPathConnection = useInteractionsStore((state) => state.startPathConnection);
    const endPathConnection = useInteractionsStore((state) => state.endPathConnection);

    const segmentConnectionStarted = connectionStartedWaypointId !== null;

    useEffect(() => {
        if (!g || !waypoint || !type) return;

        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));

        const renderedMarker = renderMarker({
            g,
            point,
            additionalText: waypoint.additionalText,
            hidden: waypoint.hidden ?? false,
            radius: type.radiusOverride ? type.radiusOverride : waypointRadius,
            type,
            group,
            borderWidth: waypointBorderWidth,
            borderColor: waypointBorderColor,
            showBorder: showWaypointBorder,
            visualizeHiddenItems: props.visualizeHiddenItems ?? true,
        });

        renderedMarker.attr("id", `waypoint-${waypoint.id}`).classed("waypoint", true);

        let bearingDistanceOverlay: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

        if (isRelativeWaypointStart) {
            bearingDistanceOverlay = renderBearingDistanceVisual({
                g,
                map,
                waypoint,
                bearingDeg: relativeWaypoint.bearing,
                distanceMeters: relativeWaypoint.distance,
            });
        }

        const updateSelectionVisual = (selected: boolean) => {
            renderedMarker.select(".waypoint-selection-ring").style("display", () => (selected ? null : "none"));
            renderedMarker.select(".waypoint-label").raise();
        };

        updateSelectionVisual(isWaypointSelected);

        renderedMarker
            .on("mouseenter", () => {
                updateSelectionVisual(true);
            })
            .on("mouseleave", () => {
                updateSelectionVisual(isWaypointSelected);
            });

        if (props.highlightType) {
            renderedMarker.on("click.highlight-type", (event: Event) => {
                event.stopPropagation();

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
            renderedMarker.on("click.selection", (event: MouseEvent) => {
                event.stopPropagation();

                if (mode === "path-edit") {
                    if (connectionStartedWaypointId !== null) {
                        endPathConnection(waypoint.id);
                        return;
                    }

                    startPathConnection(waypoint.id);
                    return;
                }

                if (mode === "select") {
                    const nextWaypointIds = event.shiftKey
                        ? selectedWaypointIds.includes(waypoint.id)
                            ? selectedWaypointIds
                            : [...selectedWaypointIds, waypoint.id]
                        : [waypoint.id];

                    if (nextWaypointIds.length === 1) {
                        selectEntity("waypoint", waypoint.id, {
                            focus: () => map.flyTo([waypoint.lat, waypoint.lng], 20),
                        });
                    } else {
                        selectEntities("waypoint", nextWaypointIds);
                    }
                }
            });
        }

        return () => {
            renderedMarker.remove();
            bearingDistanceOverlay?.remove();
        };
    }, [
        g,
        waypoint,
        type,
        group,
        map,
        mode,
        selectedWaypointIds,
        isWaypointSelected,
        isRelativeWaypointStart,
        waypointRadius,
        waypointBorderWidth,
        waypointBorderColor,
        showWaypointBorder,
        segmentConnectionStarted,
        connectionStartedWaypointId,
        selectedWaypoint,
        setSelectedWaypoint,
        props.disableSelection,
        props.visualizeHiddenItems,
        props.highlightType,
        endPathConnection,
        startPathConnection,
        relativeWaypoint.bearing,
        relativeWaypoint.distance,
        selectEntity,
        selectEntities,
    ]);

    const updatePosition = useCallback(() => {
        if (!g || !waypoint) return;

        const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));

        const markerGroup = g.select(`#waypoint-${waypoint.id}`);
        markerGroup.attr("transform", `translate(${point.x}, ${point.y})`);

        const bearingDistanceOverlay = g.select(`#waypoint-bearing-distance-${waypoint.id}`);
        bearingDistanceOverlay.attr("transform", `translate(${point.x}, ${point.y})`);
    }, [g, map, waypoint]);

    useEffect(() => {
        map.on("move zoom zoomanim", updatePosition);

        return () => {
            map.off("move zoom zoomanim", updatePosition);
        };
    }, [map, updatePosition]);

    return isRelativeWaypointStart && waypoint ? <WaypointOverlayControl waypoint={waypoint} /> : null;
}, areEqual);

function areEqual(prev: WaypointProps, next: WaypointProps) {
    return prev.waypointId === next.waypointId && prev.g === next.g;
}
