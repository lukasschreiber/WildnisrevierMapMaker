import React, { useCallback, useMemo, useRef } from "react";
import { Path as TPath, usePathStore } from "../../stores/usePaths";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import L from "leaflet";
import { useSettingsStore } from "../../stores/useSettings";
import { useMap } from "../../context/useMap";
import { renderPath } from "../paths/renderPath";

type PathProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    pathId: number;
    order?: number;
    path?: TPath;
    waypoints?: Waypoint[];
    debugging?: boolean;
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

    const storeHideFancyPaths = useSettingsStore((state) => state.settings.hideFancyPaths);
    const hideFancyPaths = !props.debugging ? false : storeHideFancyPaths;

    const storeHideOriginalPaths = useSettingsStore((state) => state.settings.hideOriginalPaths);
    const hideOriginalPaths = !props.debugging ? true : storeHideOriginalPaths;

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
        const rendered = renderPath({
            g,
            map,
            path,
            points,
            hideOriginalPaths,
            hideFancyPaths,
            getWaypointById,
            selectSegment,
        });

        if (rendered) {
            if (!existing.empty()) {
                const node = existing.node()! as SVGElement;
                node.replaceWith(rendered.node()!);
            } else {
                g.node()?.appendChild(rendered.node()!);
            }
        }
    }, [g, path, waypoints, map, getWaypointById, selectSegment, order, hideFancyPaths, hideOriginalPaths]);

    React.useEffect(() => {
        draw();
    }, [draw]);

    const updatePosition = useCallback(() => {
        draw();
    }, [draw]);

    React.useEffect(() => {
        map.on("move zoom zoomanim", updatePosition);
        return () => {
            map.off("move zoom zoomanim", updatePosition);
        };
    }, [map, updatePosition]);

    return null;
}, areEqual);

function areEqual(prev: PathProps, next: PathProps) {
    return prev.pathId === next.pathId && prev.g === next.g && prev.order === next.order;
}
