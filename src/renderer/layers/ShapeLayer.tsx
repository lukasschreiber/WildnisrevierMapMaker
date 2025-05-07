import React from "react";
import { useLayer } from "../../context/LayerContext";
import { useShapeStore } from "../../stores/useShapes";
import { Shape } from "../elements/Shape";

export function ShapeLayer() {
    const g = useLayer(0);
    const shapes = useShapeStore((state) => state.shapes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

    if (!g) return null; // Ensure g is defined before proceeding

    // orders do not work after rerendering
    return shapes.map((shape, index) => (
        <React.Fragment key={shape.id}>
            <Shape g={g} shapeId={shape.id} order={index} />
        </React.Fragment>
    ));
}
