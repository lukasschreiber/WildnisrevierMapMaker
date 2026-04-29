import { RenderGroupSelection, RenderMarkerOptions } from "../types";
import { appendMarkerLabel } from "./markerLabels";
import { hasSvgIcon, renderIconMarker } from "./markerIcons";
import { isBuiltInMarkerShape, markerShapeRenderers } from "./markerShapes";

export function renderMarker({
    g,
    point,
    additionalText,
    hidden,
    isSelected,
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

    const shapeG = markerG.append("g").attr("class", "marker-shape");

    const commonOptions = {
        g: markerG,
        shapeG,
        point: { x: 0, y: 0 },
        rotation: type.rotation ?? 0,
        stroke: showBorder ? borderColor : "none",
        strokeWidth: isSelected ? 2 : borderWidth,
        isSelected,
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

    return markerG;
}
