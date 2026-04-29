import { RenderShapeOptions } from "../types";
import { dedupePoints, midpoint } from "../svg/geometry";
import { uniqueDefId } from "../svg/defs";
import { smoothControlPoints } from "./smoothControlPoints";
import { createBezierClosedPath } from "./shapePath";
import {
    renderOriginalShapeEdges,
    renderOriginalShapeVertices,
    renderShapeControlPointEdges,
} from "./shapeDebug";
import { applyShapeTexture } from "./textures";
import { renderShapeLabel } from "./shapeLabel";

export function renderShape({
    g,
    shape,
    points,
    showOriginalShapeEdges,
    showOriginalShapeVertices,
    showShapeControlPointEdges,
    labelColor,
    showSolidBlockBehindLabel,
}: RenderShapeOptions) {
    const {
        color,
        name,
        shapeType,
        texture,
        hasOutline,
        alpha,
        labelColor: labelColorOverride,
    } = shape;

    const finalLabelColor = labelColorOverride ?? labelColor;
    const group = g.append("g").attr("id", `shape-${shape.id}`);
    const patternId = uniqueDefId("pattern");
    const dedupedPoints = dedupePoints(points);

    if (showOriginalShapeVertices) {
        renderOriginalShapeVertices(group, dedupedPoints);
    }

    if (showOriginalShapeEdges) {
        renderOriginalShapeEdges(group, dedupedPoints);
    }

    if (dedupedPoints.length <= 2) {
        return null;
    }

    const controlPoints = smoothControlPoints(dedupedPoints, shapeType === "straight" ? 0 : alpha);

    if (showShapeControlPointEdges) {
        renderShapeControlPointEdges(group, controlPoints);
    }

    const pathData = createBezierClosedPath(controlPoints);

    if (!pathData) {
        return null;
    }

    const path = group.append("path")
        .attr("d", pathData)
        .style("stroke", hasOutline ? color : "none")
        .style("stroke-width", 1.5)
        .style("fill-opacity", shape.opacity ?? 0.5);

    applyShapeTexture({
        group,
        path,
        texture,
        color,
        patternId,
    });

    const labelText = `${name}`;

    if (!labelText || labelText.length === 0 || shape.labelHidden) {
        return group;
    }

    renderShapeLabel({
        group,
        point: midpoint(dedupedPoints),
        text: labelText,
        textColor: finalLabelColor,
        blockColor: color,
        showSolidBlockBehindLabel,
    });

    return group;
}
