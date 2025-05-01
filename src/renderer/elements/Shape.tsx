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

    const showOriginalShapeEdges = useSettingsStore((state) => state.settings.showOriginalShapeEdges);
    const showOriginalShapeVertices = useSettingsStore((state) => state.settings.showOriginalShapeVertices);
    const showShapeControlPointEdges = useSettingsStore((state) => state.settings.showShapeControlPointEdges);
    const shapeLabelColor = useSettingsStore((state) => state.settings.shapeLabelColor);
    const showSolidBlockBehindLabels = useSettingsStore((state) => state.settings.showSolidBlockBehindLabels);

    const shape = useShapeStore((state) => state.shapes.find((s) => s.id === shapeId));

    const allWaypoints = useWaypointStore((state) => state.waypoints);

    const waypoints = useMemo(() => {
        if (!shape) return [];
        const idList = shape.nodes.map((n) => n.waypointId);
        const waypointMap = new Map(allWaypoints.map((wp) => [wp.id, wp]));
        return idList.map((id) => waypointMap.get(id)!).filter(Boolean);
    }, [allWaypoints, shape]);

    const draw = useCallback(() => {
        if (!g || !waypoints || waypoints.length === 0 || !shape) return [];

        g.selectAll(`.shape-${shape.id}`).remove();

        if (shape.hidden) {
            return
        }

        const points = waypoints.map((waypoint) => map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng)));

        renderShape(
            g,
            shape,
            points,
            showOriginalShapeEdges,
            showOriginalShapeVertices,
            showShapeControlPointEdges,
            shapeLabelColor,
            showSolidBlockBehindLabels
        ).map((renderedComponent) => {
            renderedComponent.classed(`shape-${shape.id}`, true);
            return renderedComponent;
        });
    }, [
        waypoints,
        shape,
        g,
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
    }, [g, draw]);

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
