import * as d3 from "d3";
import L from "leaflet";
import { Waypoint } from "../../stores/useWaypoints";
import "leaflet-geometryutil";

export function renderBearingDistanceVisual({
    g,
    map,
    waypoint,
    bearingDeg,
    distanceMeters,
}: {
    g: d3.Selection<SVGGElement, unknown, null, undefined>;
    map: L.Map;
    waypoint: Waypoint;
    bearingDeg: number;
    distanceMeters: number;
}) {
    const center = map.latLngToLayerPoint([waypoint.lat, waypoint.lng]);

    const northLatLng = L.GeometryUtil.destination(L.latLng(waypoint.lat, waypoint.lng), 0, distanceMeters);

    const radiusPx = center.distanceTo(map.latLngToLayerPoint(northLatLng));
    const bearingRad = ((bearingDeg - 90) * Math.PI) / 180;

    const endX = Math.cos(bearingRad) * radiusPx;
    const endY = Math.sin(bearingRad) * radiusPx;

    const color = "#2563eb";
    const mutedColor = "#64748b";

    const overlay = g
        .append("g")
        .attr("id", `waypoint-bearing-distance-${waypoint.id}`)
        .attr("class", "waypoint-bearing-distance")
        .attr("transform", `translate(${center.x}, ${center.y})`)
        .style("pointer-events", "none");

    overlay
        .append("circle")
        .attr("r", radiusPx)
        .attr("fill", color)
        .attr("fill-opacity", 0.06)
        .attr("stroke", color)
        .attr("stroke-width", 1.25)
        .attr("stroke-dasharray", "5 5")
        .attr("stroke-opacity", 0.45);

    overlay
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -radiusPx)
        .attr("stroke", mutedColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 4")
        .attr("stroke-opacity", 0.45);

    overlay
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", "white")
        .attr("stroke-width", 5)
        .attr("stroke-linecap", "round")
        .attr("stroke-opacity", 0.9);

    overlay
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round");

    overlay
        .append("circle")
        .attr("cx", endX)
        .attr("cy", endY)
        .attr("r", 4)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    const arcRadius = Math.min(Math.max(radiusPx * 0.22, 18), 34);

    const arc = d3
        .arc()
        .innerRadius(arcRadius)
        .outerRadius(arcRadius)
        .startAngle(0)
        .endAngle((bearingDeg * Math.PI) / 180);

    overlay
        .append("path")
        .attr("d", arc as never)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.95);

    return overlay;
}
