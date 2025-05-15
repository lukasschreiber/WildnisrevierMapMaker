import { useCallback, useEffect } from "react";
import { useLayer } from "../../context/LayerContext";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import { usePathStore, PathSegment } from "../../stores/usePaths";
import { renderSegments } from "../renderSegments";
import { useMap } from "../../context/MapContext";
import { useSettingsStore } from "../../stores/useSettings";
import L from "leaflet";

export function SegmentLayer(props: {
    segments?: PathSegment[];
    waypoints?: Waypoint[];
    pathWidth?: number;
    pathColor?: string;
    pathOutlineColor?: string;
    pathOutlineWidth?: number;
    pathTension?: number;
    debugging?: boolean;
}) {
    const g = useLayer(10);
    const debugging = props.debugging ?? false;
    const segments = props.segments ?? usePathStore((state) => state.segments);
    const storeGetWaypointById = useWaypointStore((state) => state.getWaypointById);
    const getWaypointById = useCallback(
        (id: number) => {
            return props.waypoints?.find((waypoint) => waypoint.id === id) ?? storeGetWaypointById(id);
        },
        [props.waypoints, storeGetWaypointById]
    );
    const selectSegment = usePathStore((state) => state.selectSegment);
    const showSinglePaths = useSettingsStore((state) => debugging && state.settings.showSinglePaths);
    const hideOriginalPaths = useSettingsStore((state) => debugging ? state.settings.hideOriginalPaths : true);
    const hideFancyPaths = useSettingsStore((state) => state.settings.hideFancyPaths);
    const pathWidth = props.pathWidth ?? useSettingsStore((state) => state.settings.pathWidth);
    const pathColor = props.pathColor ?? useSettingsStore((state) => state.settings.pathColor);
    const pathOutlineColor = props.pathOutlineColor ?? useSettingsStore((state) => state.settings.pathOutlineColor);
    const pathOutlineWidth = props.pathOutlineWidth ?? useSettingsStore((state) => state.settings.pathOutlineWidth);
    const pathTension = props.pathTension ?? useSettingsStore((state) => state.settings.pathTension);

    const segmentConnectionStarted = usePathStore((state) => state.segmentConnectionStarted);
    const segmentConnectionStartedWaypointId = usePathStore((state) => state.connectionStartedWaypointId);

    const map = useMap();

    const draw = useCallback(() => {
        if (!g) return;
        g.selectAll(".rendered-segment").remove();
        const renderedElements = renderSegments(
            g,
            map,
            segments,
            getWaypointById,
            showSinglePaths,
            pathWidth,
            pathColor,
            pathOutlineWidth,
            pathOutlineColor,
            hideOriginalPaths,
            hideFancyPaths,
            pathTension,
            selectSegment
        );
        renderedElements.forEach((element) => {
            element.classed("rendered-segment", true);
        });
    }, [
        g,
        map,
        segments,
        getWaypointById,
        showSinglePaths,
        pathWidth,
        pathColor,
        hideOriginalPaths,
        hideFancyPaths,
        pathOutlineColor,
        pathOutlineWidth,
        pathTension,
        selectSegment,
    ]);

    useEffect(() => {
        draw();
    }, [draw]);

    const updatePosition = useCallback(() => {
        draw();
    }, [g, draw]);

    useEffect(() => {
        map.on("move zoom zoomanim", updatePosition);

        return () => {
            map.off("move zoom zoomanim", updatePosition);
        };
    }, [map, updatePosition]);

    useEffect(() => {
        if (!g) return;
        g.selectAll(".path-segment-preview").remove(); // Remove any existing preview lines

        let pathSegmentPreview = g
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0)
            .classed("path-segment-preview", true)
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

        const container = g.node()?.closest("svg");
        if (!container) {
            console.error("Container not found");
            return;
        }

        container.addEventListener("mousemove", onMouseMove);
        return () => {
            container.removeEventListener("mousemove", onMouseMove);
        };
    }, [g, segmentConnectionStarted, segmentConnectionStartedWaypointId, getWaypointById, map]);

    return null;
}
