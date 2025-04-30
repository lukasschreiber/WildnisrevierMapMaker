import * as d3 from "d3";
import { WaypointGroup } from "../stores/useGroups";
import { WaypointType } from "../stores/useWaypointTypes";

const icons = import.meta.glob('../assets/*.svg', { eager: true, query: '?raw', import: "default" }) as Record<string, string>;

export function renderMarker<E extends d3.Selection<SVGGElement, unknown, null, undefined>>(
    g: E,
    point: { x: number; y: number },
    isSelected: boolean,
    radius: number,
    type: WaypointType,
    group: WaypointGroup | undefined,
    borderWidth: number,
    borderColor: string,
    showBorder: boolean
): E {
    const r = radius;
    const isHidden = group?.hidden || type.hidden;

    const stroke = showBorder ? borderColor : "none";
    const outlineWidth = 2;

    function applyCommonAttrs<T extends SVGElement>(
        shape: d3.Selection<T, unknown, null, undefined>
    ): E {
        if (isHidden) {
            shape.attr("data-kind", "hidden-marker");
        }

        applyMarkerFill(g, shape, type.color, type.color2, type.hasTwoColors);
        applyMarkerOpacity(shape, isSelected, group?.hidden || false, type.hidden);

        return shape
            .attr("transform", `translate(${point.x}, ${point.y})`)
            .style("stroke", stroke)
            .style("stroke-width", isSelected ? outlineWidth : borderWidth)
            .style("cursor", "pointer") as unknown as E;
            
    }

    switch (type.icon) {
        case "circle":
            return applyCommonAttrs(g.append("circle").attr("r", r));

        case "square":
            const side = r * Math.SQRT2;
            return applyCommonAttrs(
                g.append("rect")
                    .attr("x", -side / 2)
                    .attr("y", -side / 2)
                    .attr("width", side)
                    .attr("height", side)
            );

        case "triangle":
            const triPath = [
                [0, -r],
                [r * Math.sin(Math.PI / 3), r / 2],
                [-r * Math.sin(Math.PI / 3), r / 2]
            ]
                .map(p => p.join(","))
                .join(" ");
            return applyCommonAttrs(g.append("polygon").attr("points", triPath));

        case "star":
            const starPoints = 5;
            const outerR = r;
            const innerR = r * 0.5;
            const angle = (i: number, radius: number) => [
                Math.cos((i * 2 * Math.PI) / (starPoints * 2) - Math.PI / 2) * radius,
                Math.sin((i * 2 * Math.PI) / (starPoints * 2) - Math.PI / 2) * radius
            ];
            const starPath = d3.range(0, starPoints * 2)
                .map(i => {
                    const [x, y] = angle(i, i % 2 === 0 ? outerR : innerR);
                    return `${x},${y}`;
                })
                .join(" ");
            return applyCommonAttrs(g.append("polygon").attr("points", starPath));

        case "cross":
            const crossSize = r * 1.5; // overall size of cross arms
            const armWidth = r * 0.6; // width of each arm
            const crossPath = `
                    M ${-armWidth / 2} ${-crossSize / 2}
                    L ${armWidth / 2} ${-crossSize / 2}
                    L ${armWidth / 2} ${-armWidth / 2}
                    L ${crossSize / 2} ${-armWidth / 2}
                    L ${crossSize / 2} ${armWidth / 2}
                    L ${armWidth / 2} ${armWidth / 2}
                    L ${armWidth / 2} ${crossSize / 2}
                    L ${-armWidth / 2} ${crossSize / 2}
                    L ${-armWidth / 2} ${armWidth / 2}
                    L ${-crossSize / 2} ${armWidth / 2}
                    L ${-crossSize / 2} ${-armWidth / 2}
                    L ${-armWidth / 2} ${-armWidth / 2}
                    Z
                `;
            return applyCommonAttrs(g.append("path").attr("d", crossPath).style("pointer-events", "all"));

        case "diamond":
            const diamondPath = [
                [0, -r],
                [r * Math.SQRT2 / 2, 0],
                [0, r],
                [-r * Math.SQRT2 / 2, 0]
            ]
                .map(p => p.join(","))
                .join(" ");
            return applyCommonAttrs(g.append("polygon").attr("points", diamondPath));
        default:
            const iconName = type.icon;
            const iconSvg = Object.entries(icons).find(([path]) => path.includes(`${iconName}.svg`))?.[1];

            if (iconSvg) {

                // Parse the SVG string into a DOM element
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(iconSvg, "image/svg+xml");
                const svgChildren = Array.from(svgDoc.documentElement.children);
                const viewBox = svgDoc.documentElement.getAttribute("viewBox");
                const [width, height] = viewBox ? viewBox.split(" ").slice(2).map(Number) : [24, 24];

                if (svgChildren.length > 1) {
                    console.warn("SVG contains multiple root elements:", iconSvg);
                }

                const child = svgChildren[0];
                const container = g.append(child.tagName);
                const attributes = Array.from(child.attributes);
                attributes.forEach(attr => {
                    if (attr.name !== "xmlns" && attr.name !== "viewBox") {
                        container.attr(attr.name, attr.value);
                    }
                });

                container.style("pointer-events", "all")
                container.attr("data-icon", iconName)

                return applyCommonAttrs(container as unknown as d3.Selection<SVGGElement, unknown, null, undefined>)
                .attr("transform", `translate(${point.x - width / 2}, ${point.y - height / 2})`)
            } else {
                console.warn("Unknown icon type and no matching SVG found:", type.icon);
                return g;
            }
    }
}

export function applyMarkerFill<T extends SVGElement | d3.BaseType>(g: d3.Selection<SVGGElement, unknown, null, undefined>, waypoint: d3.Selection<T, unknown, null, undefined>, color: string, color2?: string, hasTwoColors?: boolean) {
    const fillTop = color;
    const fillBottom = hasTwoColors ? color2 || color : color;
    const gradientId = `bg-${color.replace("#", "")}-${color2?.replace("#", "") || color.replace("#", "")}`;

    g.select(`#${gradientId}`).remove(); // Remove existing gradient

    if (color2) {
        const gradient = g.append("defs")
            .append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
        gradient.append("stop").attr("offset", "50%").style("stop-color", fillBottom);
        gradient.append("stop").attr("offset", "50%").style("stop-color", fillTop);
    }

    waypoint.attr("fill", color2 ? `url(#${gradientId})` : fillTop)
}

export function applyMarkerOpacity<T extends SVGElement | d3.BaseType>(waypoint: d3.Selection<T, unknown, null, undefined>, isSelected: boolean, groupHidden: boolean, typeHidden: boolean) {
    const isHidden = groupHidden || typeHidden;
    const opacity = isHidden ? 0.1 : isSelected ? 0.5 : 1;
    waypoint.style("opacity", opacity);
}