import React, { useCallback, useMemo, useRef } from "react";
import { Path as TPath, usePathStore } from "../../stores/usePaths";
import { useMap } from "../../context/MapContext";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import L from "leaflet";
import { renderPath } from "../renderPath";

type PathProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    pathId: number;
    order?: number;
    path?: TPath;
    waypoints?: Waypoint[];
};

export const Path = React.memo(({ g, pathId, order, ...props }: PathProps) => {
    const map = useMap();
    const renderedOrder = useRef(order);

    const pathFromStore = usePathStore((state) => state.paths.find((p) => p.id === pathId));
    const path = props.path ?? pathFromStore;

    const getWaypointById = useWaypointStore((state) => state.getWaypointById);
    const selectSegment = usePathStore((state) => state.selectSegment);

    const storeAllWaypoints = useWaypointStore((state) => state.waypoints);
    const allWaypoints = props.waypoints ?? storeAllWaypoints;

    const waypoints = useMemo(() => {
        if (!path) return [];
        const waypointMap = new Map(allWaypoints.map((wp) => [wp.id, wp]));
        // TODO: Not really good, the path could be unsteady...
        const waypoints = path.segments.map((s) => waypointMap.get(s.from.waypointId)!).filter(Boolean);
        if (path.segments.length === 0) return [];
        waypoints.push(waypointMap.get(path.segments[path.segments.length - 1].to.waypointId)!);
        return waypoints;
    }, [allWaypoints, path]);

    const draw = useCallback(() => {
        if (!g || !path) return;

        const existing = g.select(`#path-${path.id}`);

        if (renderedOrder.current !== order) {
            existing.remove();
            renderedOrder.current = order;
        }

        if (path.hidden) {
            existing.remove();
            return;
        }

        const points = waypoints.map((waypoint) => map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng)));
        const rendered = renderPath(
            g,
            map,
            path,
            points,
            // TODO: use settings
            false,
            false,
            getWaypointById,
            selectSegment,
        );

        if (rendered) {
            if (!existing.empty()) {
                const node = existing.node()! as SVGElement;
                node.replaceWith(rendered.node()!);
            } else {
                g.node()?.appendChild(rendered.node()!);
            }
        }
    }, [g, path, waypoints, map, getWaypointById, selectSegment, order]);

    React.useEffect(() => {
        draw();
    }, [draw]);

    const updatePosition = useCallback(() => {
        draw();
    }, [draw]);

    React.useEffect(() => {
        map.on("zoomend", updatePosition);
        return () => {
            map.off("zoomend", updatePosition);
        };
    }, [map, updatePosition]);

    return null;
}, areEqual);

function areEqual(prev: PathProps, next: PathProps) {
    return prev.pathId === next.pathId && prev.g === next.g && prev.order === next.order;
}