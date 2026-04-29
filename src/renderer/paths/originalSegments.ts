import L from "leaflet";
import { PathSegment } from "../../stores/usePaths";
import { RenderGroupSelection } from "../types";
import { Waypoint } from "../../stores/useWaypoints";

export function renderOriginalSegments({
    g,
    map,
    segments,
    getWaypointById,
    selectSegment,
}: {
    g: RenderGroupSelection;
    map: L.Map;
    segments: PathSegment[];
    getWaypointById: (id: number) => Waypoint | undefined;
    selectSegment: (id: number) => void;
}) {
    const rendered: d3.Selection<SVGLineElement, unknown, null, undefined>[] = [];

    segments.forEach(({ from, to, id }) => {
        const fromWaypoint = getWaypointById(from.waypointId);
        const toWaypoint = getWaypointById(to.waypointId);

        if (!fromWaypoint || !toWaypoint) {
            return;
        }

        const fromPoint = map.latLngToLayerPoint(new L.LatLng(fromWaypoint.lat, fromWaypoint.lng));
        const toPoint = map.latLngToLayerPoint(new L.LatLng(toWaypoint.lat, toWaypoint.lng));

        rendered.push(g.append("line")
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
            .on("click", (event: MouseEvent) => {
                event.stopPropagation();
                selectSegment(id);
            }));
    });

    return rendered;
}
