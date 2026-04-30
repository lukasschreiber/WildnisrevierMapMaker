import { RenderGroupSelection, RenderMarkerOptions } from "../types";
import { appendMarkerLabel } from "./markerLabels";
import { hasSvgIcon, renderIconMarker } from "./markerIcons";
import { isBuiltInMarkerShape, markerShapeRenderers } from "./markerShapes";

export function renderMarker({
    g,
    point,
    additionalText,
    hidden,
    radius,
    type,
    group,
    borderWidth,
    borderColor,
    showBorder,
    visualizeHiddenItems,
}: RenderMarkerOptions): RenderGroupSelection {
    const isHidden = Boolean(group?.hidden || type.hidden || hidden);
    const isIcon = hasSvgIcon(type.icon);

    const markerG = g.append("g").attr("class", "marker-group").attr("transform", `translate(${point.x}, ${point.y})`);

    const selectionRadius = radius * 2;

    markerG
        .append("circle")
        .attr("class", "waypoint-selection-ring")
        .attr("r", selectionRadius)
        .style("fill", "white")
        .style("stroke", "white")
        .style("stroke-width", 2)
        .style("stroke-opacity", 0.8)
        .style("fill-opacity", 0.6)
        .style("pointer-events", "none")
        .style("display", "none");

    const shapeG = markerG.append("g").attr("class", "marker-shape");

    const commonOptions = {
        g: markerG,
        shapeG,
        point: { x: 0, y: 0 },
        rotation: type.rotation ?? 0,
        stroke: showBorder ? borderColor : "none",
        strokeWidth: borderWidth,
        isIcon,
        isHidden,
        visualizeHiddenItems,
        fillColor: type.color,
        fillColor2: type.color2,
        hasTwoColors: type.hasTwoColors,
        radius,
    };

    if (isHidden) {
        markerG.attr("data-kind", "hidden-marker");
    }

    if (isBuiltInMarkerShape(type.icon)) {
        markerShapeRenderers[type.icon](commonOptions);
    } else {
        renderIconMarker({
            ...commonOptions,
            type,
        });
    }

    appendMarkerLabel(markerG, additionalText, type.additionalText);

    markerG.select(".waypoint-label").raise();

    return markerG;
}
