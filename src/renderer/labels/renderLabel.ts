import { RenderLabelOptions } from "../types";

export function renderLabel({
    g,
    x,
    y,
    text,
    hiddenOnExportKind,
    color = "black",
    fontSize = 10,
    fontWeight = "normal",
    opacity = 1,
}: RenderLabelOptions) {
    const label = g.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text)
        .style("fill", color)
        .style("font-size", `${fontSize}px`)
        .style("font-weight", fontWeight)
        .style("opacity", opacity)
        .style("pointer-events", "none");

    if (hiddenOnExportKind) {
        label.attr("data-kind", hiddenOnExportKind);
    }

    return label;
}
