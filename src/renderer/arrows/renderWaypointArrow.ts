import { RenderWaypointArrowOptions } from "../types";

export function renderWaypointArrow({
    g,
    a,
    b,
    offset,
    color,
    size,
    width,
    opacity,
}: RenderWaypointArrowOptions) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
        return g.append("g").attr("data-kind", "arrow");
    }

    const offsetX = (dx / length) * offset;
    const offsetY = (dy / length) * offset;
    const arrowX = a.x - offsetX;
    const arrowY = a.y - offsetY;
    const angle = Math.atan2(dy, dx);
    const container = g.append("g").attr("data-kind", "arrow");

    container.append("line")
        .attr("x1", b.x + offsetX)
        .attr("y1", b.y + offsetY)
        .attr("x2", arrowX)
        .attr("y2", arrowY)
        .style("stroke", color)
        .attr("stroke-linecap", "round")
        .style("stroke-width", width)
        .style("opacity", opacity);

    appendArrowHeadLine(container, arrowX, arrowY, angle - Math.PI / 6, size, color, width, opacity);
    appendArrowHeadLine(container, arrowX, arrowY, angle + Math.PI / 6, size, color, width, opacity);

    return container;
}

function appendArrowHeadLine(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number,
    angle: number,
    length: number,
    color: string,
    width: number,
    opacity: number,
) {
    container.append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", x - length * Math.cos(angle))
        .attr("y2", y - length * Math.sin(angle))
        .attr("stroke-linecap", "round")
        .style("stroke", color)
        .style("stroke-width", width)
        .style("opacity", opacity);
}
