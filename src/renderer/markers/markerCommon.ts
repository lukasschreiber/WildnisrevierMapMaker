import * as d3 from "d3";
import { RenderGroupSelection, RenderMarkerOptions } from "../types";
import { applyMarkerFill, applyMarkerOpacity } from "./markerFill";

export type CommonMarkerOptions = {
    g: RenderGroupSelection;
    shapeG: RenderGroupSelection;
    target: d3.Selection<any, unknown, null, undefined>;
    point: RenderMarkerOptions["point"];
    rotation: number;
    stroke: string;
    strokeWidth: number;
    isSelected: boolean;
    isIcon: boolean;
    isHidden: boolean;
    visualizeHiddenItems: boolean;
    fillColor: string;
    fillColor2?: string;
    hasTwoColors?: boolean;
};

export function applyMarkerCommonAttrs({
    g,
    shapeG,
    target,
    point,
    rotation,
    stroke,
    strokeWidth,
    isSelected,
    isIcon,
    isHidden,
    visualizeHiddenItems,
    fillColor,
    fillColor2,
    hasTwoColors,
}: CommonMarkerOptions) {
    applyMarkerFill(g, target, fillColor, fillColor2, hasTwoColors);
    applyMarkerOpacity(target, isSelected, isHidden);

    if (isHidden && !visualizeHiddenItems) {
        target.attr("visibility", "hidden");
    }

    shapeG.selectAll("path").style("pointer-events", "all");

    return shapeG
        .attr("transform", `translate(${point.x}, ${point.y}) rotate(${rotation})`)
        .style("stroke", stroke)
        .style("stroke-width", isIcon ? strokeWidth * 0.5 : strokeWidth)
        .style("cursor", "pointer");
}
