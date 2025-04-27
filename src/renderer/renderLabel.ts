export function renderLabel(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    text: string,
    hiddenOnExportKind: string | undefined = undefined,
    color: string = "black",
    fontSize: number = 10,
    fontWeight: string = "normal",
    opacity: number = 1,
) {
    const t = g.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text)
        .style("fill", color)
        .style("font-size", `${fontSize}px`)
        .style("font-weight", fontWeight)
        .style("opacity", opacity)
        .style("pointer-events", "none");

    if (hiddenOnExportKind) {
        t.attr("data-kind", hiddenOnExportKind);
    }
}