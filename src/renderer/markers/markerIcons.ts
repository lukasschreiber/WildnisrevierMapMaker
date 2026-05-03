import { AnyD3Selection, RenderMarkerOptions } from "../types";
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

    containerSvg
        .attr("width", targetWidth)
        .attr("height", targetHeight)
        .attr("x", -targetWidth / 2)
        .attr("y", -targetHeight / 2);

    containerSvg.selectAll("*").attr("vector-effect", "non-scaling-stroke");

    container.style("pointer-events", "all");
    container.attr("data-icon", iconName);

    return applyMarkerCommonAttrs({
        g,
        shapeG,
        target: containerSvg.selectChild() as unknown as AnyD3Selection,
        point,
        rotation: type.rotation ?? 0,
        stroke,
        strokeWidth,
        isHidden,
        visualizeHiddenItems,
        fillColor,
        fillColor2,
        hasTwoColors,
    });
}
