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

            renderSegments(g, map, segments, getWaypointById, settings.showSinglePaths, settings.pathWidth, settings.pathColor, settings.hideOriginalPaths, settings.hideFancyPaths, selectSegment);

            waypoints.forEach(({ lat, lng, id, baseId, name, typeId }) => {
                const point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
                const isSelected = id === selectedId;

                if (baseId !== undefined) {
                    const baseWaypoint = getWaypointById(baseId)!;

                    const basePoint = map.latLngToLayerPoint(new L.LatLng(baseWaypoint.lat, baseWaypoint.lng));
                    const dist = haversineDistance(lat, lng, baseWaypoint.lat, baseWaypoint.lng);

                    if (settings.showWaypointLines) {
                        renderWaypointArrow(
                            g,
                            point,
                            basePoint,
                            settings.waypointRadius,
                            settings.arrowColor,
                            settings.arrowSize,
                            settings.arrowWidth,
                            settings.arrowOpacity
                        );
                    }

                    if (settings.showWaypointDistances) {
                        renderLabel(g, (point.x + basePoint.x) / 2, (point.y + basePoint.y) / 2 - 5, `${dist.toFixed(2)} m`)
                    }
                }

                renderMarker(g, 
                    point, 
                    isSelected, 
                    settings.waypointRadius, 
                    getWaypointTypeById(typeId)!,
                    settings.waypointBorderWidth,
                    settings.waypointBorderColor,
                    settings.showWaypointBorder
                ).on(
                    "click",
                    (event: MouseEvent) => {
                        event.stopPropagation();
                        if (!addPathMode) {
                            selectWaypoint(id);
                            const waypoint = getWaypointById(id);
                            if (waypoint) {
                                const { lat, lng } = waypoint;
                                map.setView([lat, lng], map.getZoom());
                            }
                        } else {
                            if (segmentConnectionStarted) {
                                endSegmentConnection(id);
                            } else {
                                startSegmentConnection(id);
                            }
                        }
                    }
                );

                if (settings.showLabels && !getWaypointTypeById(typeId)?.hidden) {
                    renderLabel(g, point.x + 4 + settings.waypointRadius, point.y + 4, id.toString() + (name ? ` (${name})` : ""));
                }
            });
        };

        map.on("zoomend moveend", draw);
        draw();

        const onMapClick = (e: L.LeafletMouseEvent) => {
            if ((e.originalEvent.target as HTMLElement)?.closest("#menu")) return; // Ignore clicks on the menu
            if (addMode && selectedId === null) {
                addWaypoint(e.latlng.lat, e.latlng.lng);
            } else if (addPathMode) {
                cancelSegmentConnection();
            } else {
                deselectWaypoint();
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (selectedId === null) return;

            const step = 0.000001;

            // Update waypoint position with arrow keys
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                for (const wp of waypoints) {
                    if (wp.id !== selectedId) continue;
                    let { lat, lng } = wp;

                    switch (e.key) {
                        case "ArrowUp":
                            lat += step;
                            break;
                        case "ArrowDown":
                            lat -= step;
                            break;
                        case "ArrowLeft":
                            lng -= step;
                            break;
                        case "ArrowRight":
                            lng += step;
                            break;
                        default:
                            return wp;
                    }

                    updateWaypointPosition(wp.id, lat, lng); // Update the waypoint in the context
                    break; // Exit the loop after updating the selected waypoint
                }
            }

            // Delete selected waypoint on "Delete" key press
            if (e.key === "Delete" && selectedId !== null) {
                if (!isDeletable(selectedId)) return;
                const confirmed = window.confirm("Are you sure you want to delete this waypoint?");
                if (!confirmed) return;
                segments.forEach((segment) => {
                    if (segment.from.waypointId === selectedId || segment.to.waypointId === selectedId) {
                        deleteSegment(segment.id);
                    }
                });
                deleteWaypoint(selectedId); // Delete the waypoint from the context
                deselectWaypoint();
            }
        };

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
                .attr("y2", toPoint.y)
        };

        map.on("click", onMapClick);
        window.addEventListener("keydown", onKeyDown);
        container.node()!.addEventListener("mousemove", onMouseMove);

        return () => {
            map.off("zoomend moveend", draw);
            map.off("click", onMapClick);
            window.removeEventListener("keydown", onKeyDown);
            container.node()!.removeEventListener("mousemove", onMouseMove);
        };
    }, [
        map,
        waypoints,
        addMode,
        addPathMode,
        selectedId,
        settings.showLabels,
        settings.showWaypointLines,
        settings.showWaypointDistances,
        settings.waypointRadius,
        settings.arrowSize,
        settings.hideFancyPaths,
        settings.arrowOpacity,
        settings.pathWidth,
        settings.pathColor,
        settings.showSinglePaths,
        settings.arrowWidth,
        settings.arrowColor,
        settings.waypointBorderWidth,
        settings.waypointBorderColor,
        settings.showWaypointBorder,
        settings.hideOriginalPaths,
        waypointTypes,
        segments,
        segmentConnectionStarted,
        segmentConnectionStartedWaypointId,
    ]);

    return null;
}
