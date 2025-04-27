import { Shape } from "../context/ShapeContext";
import * as d3 from "d3";
import { Vector } from "../utils/vector";

interface Point {
    x: number;
    y: number;
    notsmooth?: boolean;
}

export function renderShape(g: d3.Selection<SVGGElement, unknown, null, undefined>, shape: Shape, points: { x: number; y: number }[], showOriginalShapeEdges: boolean, showOriginalShapeVertices: boolean, showShapeControlPointEdges: boolean, labelColor: string, showSolidBlockBehindLabel: boolean): void {
    const { color, name, shapeType, texture, hasOutline, alpha } = shape;

    const patternId = `pattern-${Math.random().toString(36).substring(2, 15)}`;

    const dedupedPoints = Array.from(new Set(points.map(p => `${p.x},${p.y}`))).map(p => {
        const [x, y] = p.split(",").map(Number);
        return { x, y };
    });

    if (showOriginalShapeVertices) {
        const pointGroup = g.append("g");

        pointGroup.selectAll("circle")
            .data(dedupedPoints)
            .join("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 5)
            .style("fill", "red");
    }

    if (showOriginalShapeEdges) {
        const closedLine = d3.line<{ x: number, y: number }>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveLinearClosed); // like your ctx.lineTo + closePath

        g.append("path")
            .attr("d", closedLine(dedupedPoints))
            .style("stroke", "#222")
            .style("stroke-width", 0.7)
            .style("fill", "none");
    }

    const controlPoints = smoothControlPoints(dedupedPoints, shapeType === "straight" ? 0 : alpha);

    if (showShapeControlPointEdges) {
        const controlLine = d3.line<{ x: number, y: number }>()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveLinear); // simple straight lines

        const controlPathPoints: { x: number, y: number }[] = [];
        for (let i = 0; i < controlPoints.length; i += 3) {
            controlPathPoints.push(
                controlPoints[(i + 1) % controlPoints.length],
                controlPoints[(i + 2) % controlPoints.length],
                controlPoints[(i + 3) % controlPoints.length],
                controlPoints[(i + 4) % controlPoints.length]
            );
        }

        g.append("path")
            .attr("d", controlLine(controlPathPoints))
            .style("stroke", "blue")
            .style("stroke-width", 1)
            .style("fill", "none");

    }

    const p = d3.path();

    const m = controlPoints.length;
    const start = controlPoints[1];
    p.moveTo(start.x, start.y);

    for (let i = 0; i < m; i += 3) {
        const b = controlPoints[(i + 2) % m];
        const c = controlPoints[(i + 3) % m];
        const d = controlPoints[(i + 4) % m];
        p.bezierCurveTo(b.x, b.y, c.x, c.y, d.x, d.y);
    }

    const path = g.append("path")
        .attr("d", p.toString())
        .style("stroke", hasOutline ? color : "none")
        .style("stroke-width", 1.5);

    if (texture === "gradient") {
        g.append("defs").append("linearGradient")
            .attr("id", patternId)
            .selectAll("stop")
            .data([
                { offset: "0%", color: d3.rgb(color).darker(2) },
                { offset: "100%", color: d3.rgb(color).brighter(2) }
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color.formatHex());

        path.style("fill", `url(#${patternId})`);
    } else if (texture === "lines") {
        const pattern = g.append("defs").append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 8)
            .attr("height", 8);

        pattern.append("path")
            .attr("d", "M 0,0 L 8,8 M -8,0 L 0,8 M 0,-8 L 8,0")
            .style("stroke", color)
            .style("stroke-width", 1);

        path.style("fill", `url(#${patternId})`);
    } else if (texture === "dots") {
        const pattern = g.append("defs").append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 4)
            .attr("height", 4);

        pattern.append("circle")
            .attr("cx", 2)
            .attr("cy", 2)
            .attr("r", 1)
            .style("fill", color);

        path.style("fill", `url(#${patternId})`);
    } else if (texture === "checkered") {
        const pattern = g.append("defs").append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 8)
            .attr("height", 8);

        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 8)
            .attr("height", 8)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 1);

        path.style("fill", `url(#${patternId})`);
    } else if (texture === "chessboard") {
        const patternSize = 10; // size of each small square

        const pattern = g.append("defs").append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", patternSize * 2) // pattern covers 2x2 squares
            .attr("height", patternSize * 2);

        // Background square (light color)
        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", patternSize * 2)
            .attr("height", patternSize * 2)
            .style("fill", d3.rgb(color).brighter(1).formatHex()); // light background

        // Top-left dark square
        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", patternSize)
            .attr("height", patternSize)
            .style("fill", d3.rgb(color).darker(1).formatHex());

        // Bottom-right dark square
        pattern.append("rect")
            .attr("x", patternSize)
            .attr("y", patternSize)
            .attr("width", patternSize)
            .attr("height", patternSize)
            .style("fill", d3.rgb(color).darker(1).formatHex());

        path.style("fill", `url(#${patternId})`);
    } else if (texture === "crosses") {
        const patternSize = 12; // how far apart crosses are
        const crossSize = 4;    // size of each cross arm

        const pattern = g.append("defs").append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", patternSize)
            .attr("height", patternSize);

        // Small vertical line (centered)
        pattern.append("line")
            .attr("x1", patternSize / 2)
            .attr("y1", (patternSize / 2) - crossSize)
            .attr("x2", patternSize / 2)
            .attr("y2", (patternSize / 2) + crossSize)
            .style("stroke", color)
            .style("stroke-width", 1);

        // Small horizontal line (centered)
        pattern.append("line")
            .attr("x1", (patternSize / 2) - crossSize)
            .attr("y1", patternSize / 2)
            .attr("x2", (patternSize / 2) + crossSize)
            .attr("y2", patternSize / 2)
            .style("stroke", d3.rgb(color).darker(1.5).formatHex())
            .style("stroke-width", 1);

        path.style("fill", `url(#${patternId})`);
    } else {
        path.style("fill", color);
    }

    const midPoint = dedupedPoints.reduce((acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
    }, { x: 0, y: 0 });

    midPoint.x /= dedupedPoints.length;
    midPoint.y /= dedupedPoints.length;

    if (showSolidBlockBehindLabel) {

        const text1 = g.append("text")
            .attr("x", midPoint.x)
            .attr("y", midPoint.y)
            .text(name)
            .style("fill", labelColor)
            .style("font-size", "12px")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");

        const bbox = text1.node()!.getBBox();
        text1.remove();

        g.append("rect")
            .attr("x", bbox.x - 2)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 4)
            .attr("height", bbox.height + 4)
            .style("fill", color)
    }

    g.append("text")
        .attr("x", midPoint.x)
        .attr("y", midPoint.y)
        .text(name)
        .style("fill", labelColor)
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle");
}


function smoothControlPoints(points: Point[], edgeRatio: number = 0.333): Vector[] {
    let cp: Vector[] = [];
    let n = points.length;

    if (n > 1) {
        let eprev = new Vector(points[0].x, points[0].y).sub(new Vector(points[n - 1].x, points[n - 1].y));
        let lenprev = eprev.mag();
        eprev = eprev.scale(1 / lenprev);  // Normalize the previous edge

        for (let i = 0; i < n; i++) {
            let inext = (i + 1) % n;
            let enext = new Vector(points[inext].x, points[inext].y).sub(new Vector(points[i].x, points[i].y));
            let lennext = enext.mag();
            enext = enext.scale(1 / lennext);  // Normalize the next edge

            let tangent = eprev.add(enext).normalize();

            // If tangent is pointing in the opposite direction, invert it
            if (tangent.dot(enext) < 0) tangent = new Vector(0, 0).sub(tangent);

            if (points[i].notsmooth) {
                // If the point is "notsmooth", add 3 copies of the point
                cp.push(new Vector(points[i].x, points[i].y), new Vector(points[i].x, points[i].y), new Vector(points[i].x, points[i].y));
            } else {
                // Otherwise, calculate smooth control points
                cp.push(
                    new Vector(points[i].x, points[i].y).sub(tangent.scale(lenprev * edgeRatio)),  // First control point
                    new Vector(points[i].x, points[i].y),  // Main point
                    new Vector(points[i].x, points[i].y).add(tangent.scale(lennext * edgeRatio))  // Second control point
                );
            }

            eprev = enext;
            lenprev = lennext;
        }
    }
    return cp;
}