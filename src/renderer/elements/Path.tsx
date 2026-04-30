import React, { useCallback, useMemo, useRef } from "react";
import { Path as TPath, usePathStore } from "../../stores/usePaths";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import L from "leaflet";
import { useSettingsStore } from "../../stores/useSettings";
import { useMap } from "../../context/useMap";
import { renderPath } from "../paths/renderPath";
import { useInteractionsStore } from "../../stores/useInteractions";

type PathProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    pathId: number;
    order?: number;
    path?: TPath;
    waypoints?: Waypoint[];
    debugging?: boolean;
};

function getOrderedWaypointIdsFromSegments(path: TPath): number[] {
    if (path.segments.length === 0) return [];

    return [path.segments[0].from.waypointId, ...path.segments.map((segment) => segment.to.waypointId)];
}

export const Path = React.memo(({ g, pathId, order, ...props }: PathProps) => {
    const map = useMap();
    const renderedOrder = useRef(order);

    const pathFromStore = usePathStore((state) => state.paths.find((p) => p.id === pathId));
    const path = props.path ?? pathFromStore;

    const getWaypointById = useWaypointStore((state) => state.getWaypointById);

    const select = useInteractionsStore((state) => state.select);
    const selectOnly = useInteractionsStore((state) => state.selectOnly);
    const selectSegment = useInteractionsStore((state) => state.selectSegment);
    const isPathSelected = useInteractionsStore((state) => (path ? state.isSelected("path", path.id) : false));

    const storeAllWaypoints = useWaypointStore((state) => state.waypoints);
    const allWaypoints = props.waypoints ?? storeAllWaypoints;

    const waypoints = useMemo(() => {
        if (!path) return [];

        const waypointMap = new Map(allWaypoints.map((wp) => [wp.id, wp]));
        const waypointIds = getOrderedWaypointIdsFromSegments(path);

        return waypointIds
            .map((id) => waypointMap.get(id))
            .filter((waypoint): waypoint is Waypoint => Boolean(waypoint));
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

        if (points.length < 2) {
            existing.remove();
            return;
        }

        const rendered = renderPath({
            g,
            map,
            path,
            points,
            hideOriginalPaths,
            hideFancyPaths,
            getWaypointById,
            selectSegment,
            selected: isPathSelected, 
        });

        if (!rendered) return;

        rendered.attr("id", `path-${path.id}`).classed("path", true).classed("path-selected", isPathSelected);

        rendered.selectAll("path, line, polyline").classed("path-selected", isPathSelected);

        const handlePathClick = (event: MouseEvent) => {
            event.stopPropagation();

            if (event.shiftKey) {
                select("path", path.id);
            } else {
                selectOnly("path", path.id);
            }
        };

        rendered.on("click.selection", handlePathClick);

        rendered.selectAll("path").on("click.selection", handlePathClick);

        if (isPathSelected) {
            rendered.raise();
        }

        if (!existing.empty()) {
            const node = existing.node()! as SVGElement;
            node.replaceWith(rendered.node()!);
        } else {
            g.node()?.appendChild(rendered.node()!);
        }
    }, [g, path, waypoints, map, getWaypointById, selectSegment, order, hideFancyPaths, hideOriginalPaths, isPathSelected, select, selectOnly]);

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
    if (
        prev.pathId !== next.pathId ||
        prev.g !== next.g ||
        prev.order !== next.order ||
        prev.debugging !== next.debugging ||
        prev.path !== next.path
    ) {
        return false;
    }

    if (prev.waypoints === next.waypoints) return true;
    if (!prev.waypoints || !next.waypoints) return prev.waypoints === next.waypoints;
    if (prev.waypoints.length !== next.waypoints.length) return false;

    return prev.waypoints.every((wp, index) => {
        const nextWp = next.waypoints![index];

        return (
            wp.id === nextWp.id &&
            wp.lat === nextWp.lat &&
            wp.lng === nextWp.lng &&
            wp.hidden === nextWp.hidden &&
            wp.typeId === nextWp.typeId &&
            wp.groupId === nextWp.groupId
        );
    });
}
