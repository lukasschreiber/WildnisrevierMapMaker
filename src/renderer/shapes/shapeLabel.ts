import { RenderGroupSelection, RenderPoint } from "../types";

export function renderShapeLabel({
    group,
    point,
    text,
    textColor,
    blockColor,
    showSolidBlockBehindLabel,
}: {
    group: RenderGroupSelection;
    point: RenderPoint;
    text: string;
    textColor: string;
    blockColor: string;
    showSolidBlockBehindLabel: boolean;
}) {
    if (showSolidBlockBehindLabel) {
        const measuringText = appendLabelText(group, point, text, textColor);
        const bbox = measuringText.node()!.getBBox();
        measuringText.remove();

        group.append("rect")
            .attr("x", bbox.x - 2)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 4)
            .attr("height", bbox.height + 4)
            .style("fill", blockColor);
    }

    return appendLabelText(group, point, text, textColor);
}

function appendLabelText(
    group: RenderGroupSelection,
    point: RenderPoint,
    text: string,
    color: string,
) {
    return group.append("text")
        .attr("x", point.x)
        .attr("y", point.y)
        .text(text)
        .style("fill", color)
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle");
}
