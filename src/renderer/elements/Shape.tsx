import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import L from "leaflet";
import * as d3 from "d3";
import { useMap } from "../../context/MapContext";
import { useSettingsStore } from "../../stores/useSettings";
import { useShapeStore, Shape as TShape } from "../../stores/useShapes";
import { renderShape } from "../renderShape";

type ShapeProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    shapeId: number;
    shape?: TShape;
    waypoints?: Waypoint[];
    order?: number;
    shapeLabelColor?: string;
    showSolidBlockBehindLabels?: boolean;
};

export const Shape = React.memo(({ g, shapeId, order, ...props }: ShapeProps) => {
    const map = useMap();

    const showOriginalShapeEdges = useSettingsStore((state) => state.settings.showOriginalShapeEdges);
    const showOriginalShapeVertices = useSettingsStore((state) => state.settings.showOriginalShapeVertices);
    const showShapeControlPointEdges = useSettingsStore((state) => state.settings.showShapeControlPointEdges);
    const shapeLabelColor = props.shapeLabelColor ?? useSettingsStore((state) => state.settings.shapeLabelColor);
    const showSolidBlockBehindLabels = props.showSolidBlockBehindLabels ?? useSettingsStore((state) => state.settings.showSolidBlockBehindLabels);

    const shape = props.shape ?? useShapeStore((state) => state.shapes.find((s) => s.id === shapeId));
    const allWaypoints = props.waypoints ?? useWaypointStore((state) => state.waypoints);
    const renderedOrder = useRef(order);

    const waypoints = useMemo(() => {
        if (!shape) return [];
        const waypointMap = new Map(allWaypoints.map((wp) => [wp.id, wp]));
        return shape.nodes.map((n) => waypointMap.get(n.waypointId)!).filter(Boolean);
    }, [allWaypoints, shape]);

    const draw = useCallback(() => {
        if (!g || !waypoints || waypoints.length === 0 || !shape) return;

        const existing = g.select(`#shape-${shape.id}`);

        if (renderedOrder.current !== order) {
            existing.remove();
            renderedOrder.current = order;
        }

        if (shape.hidden) {
            existing.remove();
            return;
        }

        const points = waypoints.map((waypoint) => map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng)));

        const rendered = renderShape(
            map,
            g,
            shape,
            points,
            showOriginalShapeEdges,
            showOriginalShapeVertices,
            showShapeControlPointEdges,
            shapeLabelColor,
            showSolidBlockBehindLabels
        );

        if (rendered) {
            if (!existing.empty()) {
                const node = existing.node()! as SVGElement;
                node.replaceWith(rendered.node()!);
            } else {
                g.node()?.appendChild(rendered.node()!);
            }
        }
    }, [
        g,
        shape,
        waypoints,
        map,
        showOriginalShapeEdges,
        showOriginalShapeVertices,
        showShapeControlPointEdges,
        shapeLabelColor,
        showSolidBlockBehindLabels,
        order,
    ]);

    useEffect(() => {
        draw();
    }, [draw]);

    const updatePosition = useCallback(() => {
        draw();
    }, [draw]);

    useEffect(() => {
        map.on("zoomend", updatePosition);
        map.on("moveend", updatePosition);
        return () => {
            map.off("zoomend", updatePosition);
            map.off("moveend", updatePosition);
        };
    }, [map, updatePosition]);

    return null;
}, areEqual);

function areEqual(prev: ShapeProps, next: ShapeProps) {
    return prev.shapeId === next.shapeId && prev.g === next.g && prev.order === next.order;
}
