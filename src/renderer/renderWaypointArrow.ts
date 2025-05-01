export function renderWaypointArrow(g: d3.Selection<SVGGElement, unknown, null, undefined>, a: L.Point, b: L.Point, offset: number, color: string, size: number, width: number, opacity: number) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const offsetX = (dx / length) * offset;
    const offsetY = (dy / length) * offset;

    const container = g.append("g").attr("data-kind", "arrow");

    container.append("line")
        .attr("x1", b.x + offsetX)
        .attr("y1", b.y + offsetY)
        .attr("x2", a.x - offsetX)
        .attr("y2", a.y - offsetY)
        .style("stroke", color)
        .attr("stroke-linecap", "round")
        .style("stroke-width", width)
        .style("opacity", opacity);

    // arrowhead
    const arrowLength = size;
    const angle = Math.atan2(dy, dx);
    const arrowX = a.x - offsetX;
    const arrowY = a.y - offsetY;
    const arrowX1 = arrowX - arrowLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = arrowY - arrowLength * Math.sin(angle - Math.PI / 6);

    const arrowX2 = arrowX - arrowLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = arrowY - arrowLength * Math.sin(angle + Math.PI / 6);

    container.append("line")
        .attr("x1", arrowX)
        .attr("y1", arrowY)
        .attr("x2", arrowX1)
        .attr("y2", arrowY1)
        .attr("stroke-linecap", "round")
        .style("stroke", color)
        .style("stroke-width", width)
        .style("opacity", opacity);

    container.append("line")
        .attr("x1", arrowX)
        .attr("y1", arrowY)
        .attr("x2", arrowX2)
        .attr("y2", arrowY2)
        .attr("stroke-linecap", "round")
        .style("stroke", color)
        .style("stroke-width", width)
        .style("opacity", opacity);

    return container;
}