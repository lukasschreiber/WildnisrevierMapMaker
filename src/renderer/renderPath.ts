import { Path } from "../stores/usePaths";
import * as d3 from "d3";
import L from "leaflet";

export function renderPath(g: d3.Selection<SVGGElement, unknown, null, undefined>, map: L.Map, path: Path, points: { x: number, y: number }[], hideOriginalPaths: boolean, hideFancyPaths: boolean, getWaypointById: Function, selectSegment: (id: number) => void) {
    const curve = d3.curveCardinal.tension(path.tension);
    const line = d3.line()
        .curve(curve)
        .x(d => d[0])
        .y(d => d[1]);

    const group = g.append("g")
        .attr("id", `path-${path.id}`)

    if (!hideFancyPaths) {
        if (path.outlineWidth > 0) {
            group.append("path")
                .attr("d", line(points.map(({ x, y }) => [x, y])))
                .style("fill", "none")
                .style("stroke", path.outlineColor)
                .attr("stroke-linecap", path.linecap ?? "round")
                .attr("stroke-linejoin", path.linecap ?? "round")
                .style("stroke-width", path.outlineWidth * 2 + path.width);
        }

        const fill = group.append("path")
            .attr("d", line(points.map(({ x, y }) => [x, y])))
            .style("fill", "none")
            .style("stroke", path.color)
            .attr("stroke-linecap", path.linecap ?? "round")
            .attr("stroke-linejoin", path.linecap ?? "round")
            .attr("opacity", path.opacity ?? 1)
            .style("stroke-width", path.width);

        if (path.style === "dashed") {
            fill.style("stroke-dasharray", "5, 11");
        } else if (path.style === "dotted") {
            fill.style("stroke-dasharray", "1, 11");
        }
    }

    if (!hideOriginalPaths) {
        path.segments.forEach(({ from, to, id }) => {
            const fromWaypoint = getWaypointById(from.waypointId)!;
            const toWaypoint = getWaypointById(to.waypointId)!;

            const fromPoint = map.latLngToLayerPoint(new L.LatLng(fromWaypoint.lat, fromWaypoint.lng));
            const toPoint = map.latLngToLayerPoint(new L.LatLng(toWaypoint.lat, toWaypoint.lng));

            group.append("line")
                .attr("x1", fromPoint.x)
                .attr("y1", fromPoint.y)
                .attr("x2", toPoint.x)
                .attr("y2", toPoint.y)
                .style("stroke", "black")
                .attr("stroke-linecap", "round")
                .attr("opacity", 0.5)
                .style("cursor", "pointer")
                .style("stroke-width", 2)
                .attr("data-kind", "original-path")
                .on("click",
                    (event: MouseEvent) => {
                        event.stopPropagation();
                        selectSegment(id);
                    })
        })
    }

    return group;
}