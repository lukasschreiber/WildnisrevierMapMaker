import React from "react";
import { useLayer } from "../../context/LayerContext";
import { Shape as TShape, useShapeStore } from "../../stores/useShapes";
import { Shape } from "../elements/Shape";
import { Waypoint } from "../../stores/useWaypoints";

export function ShapeLayer(props: {
    shapes?: TShape[];
    waypoints?: Waypoint[];
    shapeLabelColor?: string;
    showSolidBlockBehindLabels?: boolean;
}) {
    const g = useLayer(0);
    const shapes = props.shapes ?? useShapeStore((state) => state.shapes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

    if (!g) return null; // Ensure g is defined before proceeding

    // orders do not work after rerendering
    return shapes.map((shape, index) => (
        <React.Fragment key={shape.id}>
            <Shape
                g={g}
                shapeId={shape.id}
                order={index}
                shape={shape}
                waypoints={props.waypoints}
                shapeLabelColor={props.shapeLabelColor}
                showSolidBlockBehindLabels={props.showSolidBlockBehindLabels}
            />
        </React.Fragment>
    ));
}
