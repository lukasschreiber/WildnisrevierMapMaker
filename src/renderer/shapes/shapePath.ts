import * as d3 from "d3";
import { RenderPoint } from "../types";
import { Vector } from "../../utils/vector";

export function createClosedLinearPath(points: RenderPoint[]): string | null {
    const line = d3.line<RenderPoint>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveLinearClosed);

    return line(points);
}

export function createBezierClosedPath(controlPoints: Vector[]): string | null {
    const path = d3.path();
    const m = controlPoints.length;

    if (m < 1) {
        return null;
    }

    const start = controlPoints[1];
    path.moveTo(start.x, start.y);

    for (let i = 0; i < m; i += 3) {
        const b = controlPoints[(i + 2) % m];
        const c = controlPoints[(i + 3) % m];
        const d = controlPoints[(i + 4) % m];
        path.bezierCurveTo(b.x, b.y, c.x, c.y, d.x, d.y);
    }

    return path.toString();
}
