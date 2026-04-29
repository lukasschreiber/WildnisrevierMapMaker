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
    const shapeG = g.append("g").attr("class", "marker-group");

    const commonOptions = {
        g,
        shapeG,
        point,
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
        shapeG.attr("data-kind", "hidden-marker");
    }

    appendMarkerLabel(shapeG, additionalText, type.additionalText);

    if (isBuiltInMarkerShape(type.icon)) {
        return markerShapeRenderers[type.icon](commonOptions);
    }

    return renderIconMarker({
        ...commonOptions,
        type,
    });
}
