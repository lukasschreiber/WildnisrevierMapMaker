import { RenderGroupSelection, RenderMarkerOptions } from "../types";

export function appendMarkerLabel(
    shapeG: RenderGroupSelection,
    additionalText: string | undefined,
    textSettings: RenderMarkerOptions["type"]["additionalText"],
) {
    if (!additionalText || !textSettings) {
        return;
    }

    shapeG.append("text")
        .attr("x", 0)
        .attr("y", 1)
        .style("font-size", textSettings.fontSize ?? 12)
        .style("font-family", textSettings.fontFamily ?? "Arial")
        .style("font-weight", textSettings.fontWeight ?? "normal")
        .style("fill", textSettings.color ?? "#000000")
        .style("pointer-events", "none")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "middle")
        .style("stroke", "none")
        .text(additionalText);
}
