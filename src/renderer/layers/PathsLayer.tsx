import React, { useCallback, useEffect } from "react";
import { useLayer } from "../../context/LayerContext";
import { Path as TPath, usePathStore } from "../../stores/usePaths";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import { Path } from "../elements/Path";
import { useMap } from "../../context/MapContext";
import L from "leaflet";

export function PathLayer(props: { paths?: TPath[]; waypoints?: Waypoint[]; debugging?: boolean }) {
    const g = useLayer(10);
    const pathsFromStore = usePathStore((state) => state.paths.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    const paths = props.paths?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? pathsFromStore;

    const segmentConnectionStarted = usePathStore((state) => state.segmentConnectionStarted);
    const segmentConnectionStartedWaypointId = usePathStore((state) => state.connectionStartedWaypointId);
    const storeGetWaypointById = useWaypointStore((state) => state.getWaypointById);
    const getWaypointById = useCallback(
        (id: number) => {
            if (props.waypoints) {
                return props.waypoints.find((waypoint) => waypoint.id === id);
            }
            return storeGetWaypointById(id);
        },
        [storeGetWaypointById, props.waypoints]
    );

    const map = useMap();

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

    if (!g) return null; // Ensure g is defined before proceeding

    return paths.map((path, index) => {
        return (
            <React.Fragment key={path.id}>
                <Path g={g} pathId={path.id} order={path.order ?? index} path={props.paths && path} debugging={props.debugging} waypoints={props.waypoints} />
            </React.Fragment>
        );
    });
}
