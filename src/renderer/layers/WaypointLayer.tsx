import { useCallback, useEffect, useMemo } from "react";
import { useLayer } from "../../context/LayerContext";
import { useMap } from "react-leaflet";
import { useSettings } from "../../settings/useSettings";
import L from "leaflet";
import * as d3 from "d3";
import { applyMarkerFill, applyMarkerOpacity } from "../renderMarkers";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointGroupStore } from "../../stores/useGroups";

export function WaypointLayer() {
    const { g, registerLayerRedrawFn } = useLayer();

    const map = useMap();
    const { settings } = useSettings();

    const waypoints = useWaypointStore((state) => state.waypoints);
    const selectedId = useWaypointStore((state) => state.selectedId);
    const getWaypointGroupById = useWaypointGroupStore((state) => state.getWaypointGroupById);

    const getTypeById = useWaypointTypeStore((state) => state.getTypeById);

    // const {
    //     addMode: addPathMode,
    //     startSegmentConnection,
    //     segmentConnectionStarted,
    //     endSegmentConnection,
    // } = usePathContext();

    // const { addMode: addShapeMode, addNode: addShapeNode, addModeReferenceShapeId } = useShapeContext();

    const waypointPositions = useMemo(() => {
        return waypoints.map((waypoint) => {
            return { id: waypoint.id, lat: waypoint.lat, lng: waypoint.lng };
        });
    }, [waypoints, map]);

    const waypointColors = useMemo(() => {
        return waypoints.map((waypoint) => {
            const type = getTypeById(waypoint.typeId)!;
            return {
                id: waypoint.id,
                color: type.color,
                color2: type.color2,
                hasTwoColors: type.hasTwoColors,
            };
        });
    }, [waypoints, getTypeById]);

    const waypointHiddenStates = useMemo(() => {
        return waypoints.map((waypoint) => {
            const type = getTypeById(waypoint.typeId)!;
            const group = getWaypointGroupById(waypoint.groupId ?? -1);
            
            return {
                id: waypoint.id,
                groupHidden: group?.hidden ?? false,
                typeHidden: type.hidden,
            };
        });
    }, [waypoints, getTypeById, getWaypointGroupById]);

    const placeWaypoints = useCallback(
        (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
            waypointPositions.forEach(({ id, lat, lng }) => {
                const point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
                g.append("circle")
                    .attr("cx", point.x)
                    .attr("cy", point.y)
                    .attr("r", settings.waypointRadius)
                    .attr("id", `waypoint-${id}`);
            });
        },
        [waypointPositions, settings.waypointRadius]
    );

    const applyWaypointColors = useCallback(
        (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
            waypointColors.forEach(({ id, color, color2, hasTwoColors }) => {
                const circle = g.select(`#waypoint-${id}`);
                if (circle.empty()) return;

                applyMarkerFill(g, circle, color, color2, hasTwoColors);
            });
        },
        [waypointColors]
    );
    
    const applyWaypointOpacity = useCallback(
        (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
            waypointHiddenStates.forEach(({ id, groupHidden, typeHidden }) => {
                const circle = g.select(`#waypoint-${id}`);
                if (circle.empty()) return;

                applyMarkerOpacity(circle, id === selectedId, groupHidden, typeHidden);
            });
        },
        [waypointHiddenStates, selectedId]
    );

    // const draw = useCallback((g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    //     waypoints.forEach(({ lat, lng, id, baseId, name, typeId, groupId }) => {
    //         const point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
    //         const isSelected = id === selectedId;

    //         if (baseId !== undefined) {
    //             const baseWaypoint = getWaypointById(baseId)!;

    //             const basePoint = map.latLngToLayerPoint(new L.LatLng(baseWaypoint.lat, baseWaypoint.lng));
    //             const dist = haversineDistance(lat, lng, baseWaypoint.lat, baseWaypoint.lng);

    //             if (settings.showWaypointLines) {
    //                 renderWaypointArrow(
    //                     g,
    //                     point,
    //                     basePoint,
    //                     settings.waypointRadius,
    //                     settings.arrowColor,
    //                     settings.arrowSize,
    //                     settings.arrowWidth,
    //                     settings.arrowOpacity
    //                 );
    //             }

    //             if (settings.showWaypointDistances) {
    //                 renderLabel(
    //                     g,
    //                     (point.x + basePoint.x) / 2,
    //                     (point.y + basePoint.y) / 2 - 5,
    //                     `${dist.toFixed(2)} m`,
    //                     "distance-label",
    //                     settings.labelColor
    //                 );
    //             }
    //         }

    //         const type = getWaypointTypeById(typeId)!;

    //         renderMarker(
    //             g,
    //             point,
    //             isSelected,
    //             type.radiusOverride ?? settings.waypointRadius,
    //             type,
    //             getWaypointGroupById(groupId ?? -1),
    //             settings.waypointBorderWidth,
    //             settings.waypointBorderColor,
    //             settings.showWaypointBorder
    //         ).on("click", (event: MouseEvent) => {
    //             event.stopPropagation();
    //             if (addPathMode) {
    //                 if (segmentConnectionStarted) {
    //                     endSegmentConnection(id);
    //                 } else {
    //                     startSegmentConnection(id);
    //                 }
    //             } else if (addShapeMode) {
    //                 if (addModeReferenceShapeId) {
    //                     console.log("Adding node to shape", addModeReferenceShapeId);
    //                     addShapeNode(addModeReferenceShapeId, id);
    //                 }
    //             } else {
    //                 selectWaypoint(id);
    //                 const waypoint = getWaypointById(id);
    //                 if (waypoint) {
    //                     const { lat, lng } = waypoint;
    //                     map.setView([lat, lng], map.getZoom());
    //                 }
    //             }
    //         });

    //         if (
    //             settings.showLabels &&
    //             !getWaypointTypeById(typeId)?.hidden &&
    //             !getWaypointGroupById(groupId ?? -1)?.hidden
    //         ) {
    //             renderLabel(
    //                 g,
    //                 point.x + 4 + settings.waypointRadius,
    //                 point.y + 4,
    //                 id.toString() + (name ? ` (${name})` : ""),
    //                 undefined,
    //                 settings.labelColor
    //             );
    //         }
    //     });

    //     g.attr("class", "waypoint-layer");
    //     g.attr("id", "waypoint-layer");
    //     return g;
    // }, [
    //     map,
    //     waypoints,
    //     selectedId,
    //     addPathMode,
    //     addShapeMode,
    //     addModeReferenceShapeId,
    //     settings.showLabels,
    //     settings.showWaypointLines,
    //     settings.showWaypointDistances,
    //     settings.waypointRadius,
    //     settings.arrowSize,
    //     settings.arrowOpacity,
    //     settings.arrowWidth,
    //     settings.arrowColor,
    //     settings.waypointBorderWidth,
    //     settings.waypointBorderColor,
    //     settings.showWaypointBorder,
    //     getWaypointById,
    //     getWaypointGroupById,
    //     getWaypointTypeById,
    //     selectWaypoint,
    //     startSegmentConnection,
    //     endSegmentConnection,
    // ]);

    const fullRedraw = useCallback(
        (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
            placeWaypoints(g);
            applyWaypointColors(g);
            applyWaypointOpacity(g);
            return g;
        },
        [placeWaypoints, applyWaypointColors, applyWaypointOpacity]
    );

    useEffect(() => {
        if (g.current) {
            const updatedG = fullRedraw(g.current);
            return () => {
                updatedG.selectAll("*").remove();
            };
        }
    }, [g, placeWaypoints]);

    useEffect(() => {
        const container = g.current;
        if (container) {
            applyWaypointColors(container);
        }
    }, [g, applyWaypointColors]);

    useEffect(() => {
        const container = g.current;
        if (container) {
            applyWaypointOpacity(container);
        }
    }, [g, applyWaypointOpacity]);

    useEffect(() => {
        registerLayerRedrawFn("waypoint-layer", fullRedraw);
    }, [g, fullRedraw]);

    return null;
}
