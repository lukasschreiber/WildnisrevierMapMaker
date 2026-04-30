import React, { useCallback, useEffect, useMemo } from "react";
import { Path as TPath, usePathStore } from "../../stores/usePaths";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import { Path } from "../elements/Path";
import L from "leaflet";
import { useLayer } from "../../context/useLayer";
import { useMap } from "../../context/useMap";
import { useInteractionsStore } from "../../stores/useInteractions";
import { renderPath } from "../paths/renderPath";
import { findExtendablePathFromWaypoint, getOrderedWaypointIdsFromPath } from "../paths/pathUtils";
import { createPreviewPath } from "../paths/createPreviewPath";

const PREVIEW_WAYPOINT_ID = -999;

export function PathLayer(props: { paths?: TPath[]; waypoints?: Waypoint[]; debugging?: boolean }) {
    const g = useLayer(10);

    const storePaths = usePathStore((state) => state.paths);

    const pathsFromStore = useMemo(() => {
        return [...storePaths].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [storePaths]);

    const paths = useMemo(() => {
        return props.paths !== undefined
            ? [...props.paths].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            : pathsFromStore;
    }, [props.paths, pathsFromStore]);

    const segmentConnectionStartedWaypointId = useInteractionsStore(
        (state) => state.pathEdit.connectionStartedWaypointId,
    );

    const storeWaypoints = useWaypointStore((state) => state.waypoints);
    const allWaypoints = props.waypoints ?? storeWaypoints;

    const storeGetWaypointById = useWaypointStore((state) => state.getWaypointById);

    const getWaypointById = useCallback(
        (id: number) => {
            if (props.waypoints) {
                return props.waypoints.find((waypoint) => waypoint.id === id);
            }

            return storeGetWaypointById(id);
        },
        [storeGetWaypointById, props.waypoints],
    );

    const map = useMap();

    useEffect(() => {
        if (!g) return;

        const restoreHiddenPreviewedPaths = () => {
            g.selectAll(".path-hidden-during-preview")
                .classed("path-hidden-during-preview", false)
                .style("opacity", null);
        };

        const removePreview = () => {
            g.select("#path-segment-preview").remove();
            g.selectAll(".path-segment-preview").remove();
            restoreHiddenPreviewedPaths();
        };

        removePreview();

        const onMouseMove = (e: MouseEvent) => {
            removePreview();

            if (segmentConnectionStartedWaypointId === null) return;

            const fromWaypoint = getWaypointById(segmentConnectionStartedWaypointId);
            if (!fromWaypoint) return;

            const toLatLng = map.mouseEventToLatLng(e);

            const previewWaypoint: Waypoint = {
                ...fromWaypoint,
                id: PREVIEW_WAYPOINT_ID,
                name: "Preview",
                lat: toLatLng.lat,
                lng: toLatLng.lng,
            };

            const basePath = findExtendablePathFromWaypoint(paths, segmentConnectionStartedWaypointId);

            if (basePath) {
                g.select(`#path-${basePath.id}`).classed("path-hidden-during-preview", true).style("opacity", 0);
            }

            const previewPath = createPreviewPath(basePath, segmentConnectionStartedWaypointId, PREVIEW_WAYPOINT_ID);

            const waypointMap = new Map<number, Waypoint>([
                ...allWaypoints.map((waypoint) => [waypoint.id, waypoint] as const),
                [PREVIEW_WAYPOINT_ID, previewWaypoint],
            ]);

            const previewWaypoints = getOrderedWaypointIdsFromPath(previewPath)
                .map((id) => waypointMap.get(id))
                .filter((waypoint): waypoint is Waypoint => Boolean(waypoint));

            const points = previewWaypoints.map((waypoint) =>
                map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng)),
            );

            const renderedPreview = renderPath({
                g,
                map,
                path: previewPath,
                points,
                hideOriginalPaths: true,
                hideFancyPaths: false,
                getWaypointById: (id) => waypointMap.get(id),
                selectSegment: () => {},
            });

            renderedPreview
                .attr("id", "path-segment-preview")
                .classed("path-segment-preview", true)
                .style("pointer-events", "none")
                .style("opacity", 0.75)
                .raise();

            renderedPreview.selectAll("*").style("pointer-events", "none");
        };

        const container = g.node()?.closest("svg");

        if (!container) {
            console.error("Container not found");
            return;
        }

        container.addEventListener("mousemove", onMouseMove);

        return () => {
            container.removeEventListener("mousemove", onMouseMove);
            removePreview();
        };
    }, [g, segmentConnectionStartedWaypointId, getWaypointById, map, allWaypoints, paths]);

    if (!g) return null;

    return paths.map((path, index) => (
        <React.Fragment key={path.id}>
            <Path
                g={g}
                pathId={path.id}
                order={path.order ?? index}
                path={props.paths && path}
                debugging={props.debugging}
                waypoints={props.waypoints}
            />
        </React.Fragment>
    ));
}
