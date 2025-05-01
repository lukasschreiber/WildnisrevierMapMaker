import React, { useCallback, useEffect, useMemo } from "react";
import { useWaypointStore } from "../../stores/useWaypoints";
import L from "leaflet";
import * as d3 from "d3";
import { useMap } from "react-leaflet";
import { useSettingsStore } from "../../stores/useSettings";
import { useShapeStore } from "../../stores/useShapes";
import { renderShape } from "../renderShape";

type ShapeProps = {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
    shapeId: number;
};

export const Shape = React.memo(({ g, shapeId }: ShapeProps) => {
    const map = useMap();

    const {
        showOriginalShapeEdges,
        showOriginalShapeVertices,
        showShapeControlPointEdges,
        shapeLabelColor,
        showSolidBlockBehindLabels,
    } = useSettingsStore((state) => state.settings);

    const shape = useShapeStore((state) => state.shapes.find((s) => s.id === shapeId));
    const allWaypoints = useWaypointStore((state) => state.waypoints);

    const waypoints = useMemo(() => {
        if (!shape) return [];
        const waypointMap = new Map(allWaypoints.map((wp) => [wp.id, wp]));
        return shape.nodes.map((n) => waypointMap.get(n.waypointId)!).filter(Boolean);
    }, [allWaypoints, shape]);

    const draw = useCallback(() => {
        if (!g || !waypoints || waypoints.length === 0 || !shape) return;

        const existing = g.select(`#shape-${shape.id}`);

        if (shape.hidden) {
            existing.remove();
            return;
        }

        const points = waypoints.map((waypoint) => map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng)));

        const rendered = renderShape(
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
                console.log("Replacing existing shape");
                const node = existing.node()! as SVGElement;
                node.replaceWith(rendered.node()!);
            } else {
                console.log("Appending new shape");
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
    return prev.shapeId === next.shapeId && prev.g === next.g;
}
