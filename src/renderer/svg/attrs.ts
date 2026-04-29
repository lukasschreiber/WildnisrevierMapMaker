import * as d3 from "d3";

export function styleStroke<T extends SVGElement | d3.BaseType>(
    selection: d3.Selection<T, unknown, null, undefined>,
    color: string,
    width: number,
    options: {
        linecap?: string;
        linejoin?: string;
        opacity?: number;
        fill?: string;
    } = {},
) {
    const {
        linecap = "round",
        linejoin = linecap,
        opacity = 1,
        fill = "none",
    } = options;

    return selection
        .style("fill", fill)
        .style("stroke", color)
        .style("stroke-width", width)
        .attr("stroke-linecap", linecap)
        .attr("stroke-linejoin", linejoin)
        .attr("opacity", opacity);
}
