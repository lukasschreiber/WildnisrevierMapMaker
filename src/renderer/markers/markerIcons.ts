import * as d3 from "d3";
import { RenderMarkerOptions } from "../types";
import { CommonMarkerOptions, applyMarkerCommonAttrs } from "./markerCommon";

const icons = import.meta.glob("../../assets/*.svg", {
    eager: true,
    query: "?raw",
    import: "default",
}) as Record<string, string>;

export function hasSvgIcon(iconName: string | undefined): boolean {
    return Boolean(iconName && Object.keys(icons).some((path) => path.includes(`${iconName}.svg`)));
}

export function renderIconMarker({
    g,
    shapeG,
    point,
    type,
    radius,
    stroke,
    strokeWidth,
    isSelected,
    isIcon,
    isHidden,
    visualizeHiddenItems,
    fillColor,
    fillColor2,
    hasTwoColors,
}: Omit<CommonMarkerOptions, "target" | "rotation"> & {
    type: RenderMarkerOptions["type"];
    radius: number;
    strokeWidth: number;
}) {
    const iconName = type.icon;
    const iconSvg = Object.entries(icons).find(([path]) => path.includes(`${iconName}.svg`))?.[1];

    if (!iconSvg) {
        console.warn("Unknown icon type and no matching SVG found:", type.icon, type.id, type.name);
        return g;
    }

    const targetWidth = radius * 2;
    const targetHeight = radius * 2;
    const container = shapeG.append("g").html(iconSvg);
    const containerSvg = container.select("svg");

    containerSvg.attr("width", targetWidth);
    containerSvg.attr("height", targetHeight);
    container.style("pointer-events", "all");
    container.attr("data-icon", iconName);
    container.attr("icon-offset-x", `${targetWidth / 2}`);
    container.attr("icon-offset-y", `${targetHeight / 2}`);

    return applyMarkerCommonAttrs({
        g,
        shapeG,
        target: containerSvg.selectChild() as unknown as d3.Selection<any, unknown, null, undefined>,
        point,
        rotation: type.rotation ?? 0,
        stroke,
        strokeWidth,
        isSelected,
        isIcon,
        isHidden,
        visualizeHiddenItems,
        fillColor,
        fillColor2,
        hasTwoColors,
    });
}
