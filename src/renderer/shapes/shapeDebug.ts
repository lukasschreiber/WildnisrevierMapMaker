import * as d3 from "d3";
import { RenderGroupSelection, RenderPoint } from "../types";
import { createClosedLinearPath } from "./shapePath";
import { Vector } from "../../utils/vector";

export function renderOriginalShapeVertices(group: RenderGroupSelection, points: RenderPoint[]) {
    group.append("g")
        .selectAll("circle")
        .data(points)
        .join("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 5)
        .style("fill", "red");
}

export function renderOriginalShapeEdges(group: RenderGroupSelection, points: RenderPoint[]) {
    const pathData = createClosedLinearPath(points);
    if (!pathData) return;

    group.append("path")
        .attr("d", pathData)
        .style("stroke", "#222")
        .style("stroke-width", 0.7)
        .style("fill", "none");
}

export function renderShapeControlPointEdges(group: RenderGroupSelection, controlPoints: Vector[]) {
    const controlLine = d3.line<{ x: number; y: number }>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveLinear);

    const controlPathPoints: { x: number; y: number }[] = [];

    for (let i = 0; i < controlPoints.length; i += 3) {
        controlPathPoints.push(
            controlPoints[(i + 1) % controlPoints.length],
            controlPoints[(i + 2) % controlPoints.length],
            controlPoints[(i + 3) % controlPoints.length],
            controlPoints[(i + 4) % controlPoints.length],
        );
    }

    group.append("path")
        .attr("d", controlLine(controlPathPoints))
        .style("stroke", "blue")
        .style("stroke-width", 1)
        .style("fill", "none");
}
