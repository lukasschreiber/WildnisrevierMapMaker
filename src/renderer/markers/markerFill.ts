import * as d3 from "d3";
import { RenderGroupSelection } from "../types";
import { safeIdPart } from "../svg/defs";

export function applyMarkerFill<T extends SVGElement | d3.BaseType>(
    g: RenderGroupSelection,
    waypoint: d3.Selection<T, unknown, null, undefined>,
    color: string,
    color2?: string,
    hasTwoColors?: boolean,
) {
    const fillTop = color;
    const fillBottom = hasTwoColors ? color2 || color : color;
    const gradientId = `bg-${safeIdPart(color)}-${safeIdPart(color2 || color)}`;

    g.select(`#${gradientId}`).remove();

    if (color2) {
        const gradient = g.append("defs")
            .append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "100%")
            .attr("y2", "0%");

        gradient.append("stop").attr("offset", "50%").style("stop-color", fillBottom);
        gradient.append("stop").attr("offset", "50%").style("stop-color", fillTop);
    }

    waypoint.attr("fill", color2 ? `url(#${gradientId})` : fillTop);
}

export function applyMarkerOpacity<T extends SVGElement | d3.BaseType>(
    waypoint: d3.Selection<T, unknown, null, undefined>,
    isHidden: boolean,
) {
    const opacity = isHidden ? 0.1 : 1;
    waypoint.style("opacity", opacity);
}
