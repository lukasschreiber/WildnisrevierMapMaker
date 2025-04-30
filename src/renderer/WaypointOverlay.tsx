import L from "leaflet";
import * as d3 from "d3";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useWaypointContext } from "../context/WaypointContext";
import { haversineDistance } from "../renderer/relativeWaypoints";
import { useSettings } from "../settings/useSettings";
import { renderMarker } from "../renderer/renderMarkers";
import { useWaypointTypeContext } from "../context/WaypointTypeContext";
import { usePathContext } from "../context/PathContext";
import { renderSegments } from "../renderer/renderSegments";
import { renderWaypointArrow } from "../renderer/renderWaypointArrow";
import { renderLabel } from "../renderer/renderLabel";
import { useWaypointGroupContext } from "../context/WaypointGroupContext";
import { useShapeContext } from "../context/ShapeContext";
import { renderShape } from "../renderer/renderShape";

export function WaypointOverlay() {
    const {
        addMode,
        waypoints,
        addWaypoint,
        selectedId,
        isDeletable,
        selectWaypoint,
        deselectWaypoint,
        getWaypointById,
        updateWaypointPosition,
        deleteWaypoint,
    } = useWaypointContext();

    const { getWaypointGroupById, waypointGroups } = useWaypointGroupContext();

    const {
        addMode: addPathMode,
        startSegmentConnection,
        segmentConnectionStarted,
        segmentConnectionStartedWaypointId,
        endSegmentConnection,
        cancelSegmentConnection,
        deleteSegment,
        segments,
        selectSegment,
    } = usePathContext();

    const { addMode: addShapeMode, addNode: addShapeNode, addModeReferenceShapeId, shapes } = useShapeContext();

    const { getWaypointTypeById, waypointTypes } = useWaypointTypeContext();
    const map = useMap();
    const { settings } = useSettings();

    useEffect(() => {
        const svgLayer = L.svg();
        svgLayer.addTo(map);

        const container = d3.select(map.getPanes().overlayPane).select<SVGSVGElement>("svg");
        container.style("pointer-events", "auto"); // enable interaction

        let g = container.select<SVGGElement>("g.leaflet-zoom-hide");
        if (g.empty()) {
            g = container.append("g").classed("leaflet-zoom-hide", true).attr("id", "waypoint-overlay");
        }

        const draw = () => {
            g.selectAll("*").remove();

            shapes.forEach((shape) => {
                if (!shape.nodes || shape.nodes.length === 0) return; // Skip shapes without nodes
                const points = shape.nodes.map((node) => {
                    const waypoint = getWaypointById(node.waypointId)!;
                    return map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
                });

                renderShape(
                    g,
                    shape,
                    points,
                    settings.showOriginalShapeEdges,
                    settings.showOriginalShapeVertices,
                    settings.showShapeControlPointEdges,
                    settings.shapeLabelColor,
                    settings.showSolidBlockBehindLabels
                );
            });

            renderSegments(
                g,
                map,
                segments,
                getWaypointById,
                settings.showSinglePaths,
                settings.pathWidth,
                settings.pathColor,
                settings.hideOriginalPaths,
                settings.hideFancyPaths,
                settings.pathTension,
                selectSegment
            );

            
        };

        map.on("zoomend moveend", draw);
        draw();

        let pathSegmentPreview = g
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0)
            .style("stroke", "black")
            .attr("stroke-linecap", "round")
            .style("stroke-width", 5)
            .style("pointer-events", "none") // Disable pointer events for the preview line
            .style("display", "none") // Initially hidden
            .style("opacity", 0.5);

        const onMouseMove = (e: MouseEvent) => {
            if (!segmentConnectionStarted || !segmentConnectionStartedWaypointId) {
                pathSegmentPreview.style("display", "none");
                return;
            }

            const fromWaypoint = getWaypointById(segmentConnectionStartedWaypointId)!;
            const fromPoint = map.latLngToLayerPoint(new L.LatLng(fromWaypoint.lat, fromWaypoint.lng));
            const toLatLng = map.mouseEventToLatLng(e);
            const toPoint = map.latLngToLayerPoint(toLatLng);

            pathSegmentPreview
                .style("display", "block")
                .attr("x1", fromPoint.x)
                .attr("y1", fromPoint.y)
                .attr("x2", toPoint.x)
                .attr("y2", toPoint.y);
        };

        container.node()!.addEventListener("mousemove", onMouseMove);

        return () => {
            map.off("zoomend moveend", draw);
            container.node()!.removeEventListener("mousemove", onMouseMove);
        };
    }, [
        map,
        waypoints,
        addMode,
        addPathMode,
        addModeReferenceShapeId,
        addShapeMode,
        shapes,
        selectedId,
        settings.showLabels,
        settings.showWaypointLines,
        settings.pathTension,
        settings.showWaypointDistances,
        settings.waypointRadius,
        settings.arrowSize,
        settings.hideFancyPaths,
        settings.arrowOpacity,
        settings.pathWidth,
        settings.pathColor,
        settings.labelColor,
        settings.shapeLabelColor,
        settings.showSinglePaths,
        settings.arrowWidth,
        settings.arrowColor,
        settings.waypointBorderWidth,
        settings.waypointBorderColor,
        settings.showWaypointBorder,
        settings.hideOriginalPaths,
        settings.showOriginalShapeEdges,
        settings.showOriginalShapeVertices,
        settings.showShapeControlPointEdges,
        settings.showSolidBlockBehindLabels,
        waypointTypes,
        segments,
        addWaypoint,
        waypointGroups,
        segmentConnectionStarted,
        segmentConnectionStartedWaypointId,
    ]);

    return null;
}
