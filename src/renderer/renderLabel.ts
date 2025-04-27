export function renderLabel(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    hiddenOnExport: boolean = false,
    color: string = "black",
    fontSize: number = 10,
    fontWeight: string = "normal",
    opacity: number = 1,
) {
    g.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text)
        .style("fill", color)
        .style("font-size", `${fontSize}px`)
        .style("font-weight", fontWeight)
        .style("opacity", opacity)
        .style("pointer-events", "none");

    if (hiddenOnExport) {
        g.attr("data-hidden-on-export", "true");
    }
}