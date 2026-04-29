import React from "react";
import { Shape as TShape, useShapeStore } from "../../stores/useShapes";
import { Shape } from "../elements/Shape";
import { Waypoint } from "../../stores/useWaypoints";
import { useLayer } from "../../context/useLayer";

export function ShapeLayer(props: {
    shapes?: TShape[];
    waypoints?: Waypoint[];
    shapeLabelColor?: string;
    showSolidBlockBehindLabels?: boolean;
    debugging?: boolean;
}) {
    const g = useLayer(0);
    const shapesFromStore = useShapeStore((state) => state.shapes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    const shapes = props.shapes?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? shapesFromStore;

    if (!g) return null; // Ensure g is defined before proceeding

    // orders do not work after rerendering
    return shapes.map((shape, index) => (
        <React.Fragment key={shape.id}>
            <Shape
                g={g}
                shapeId={shape.id}
                order={index}
                shape={props.shapes && shape}
                waypoints={props.waypoints}
                shapeLabelColor={props.shapeLabelColor}
                showSolidBlockBehindLabels={props.showSolidBlockBehindLabels}
            />
        </React.Fragment>
    ));
}
