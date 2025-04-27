import L from "leaflet";
import * as d3 from "d3";
import { PathSegment } from "../context/PathContext";

export function renderSegments(g: d3.Selection<SVGGElement, unknown, null, undefined>, map: L.Map, segments: any[], getWaypointById: Function, useUniqueColors: boolean, pathWidth: number, pathColor: string, hideOriginalPaths: boolean, hideFancyPaths: boolean, selectSegment: (id: number) => void) {
    const paths = getPaths(segments);
    const curve = d3.curveCardinal.tension(0); // Adjust tension for smoother curves (0 to 1)

    if (!hideFancyPaths) {
        paths.forEach((path, index) => {
            const points = path.map((node) => {
                const waypoint = getWaypointById(node)!;
                return map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
            });

            const line = d3.line()
                .curve(curve) // Apply the curve interpolation
                .x(d => d[0])
                .y(d => d[1]);

            const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000", "#000080", "#808000", "#800000", "#808080"];
            const color = useUniqueColors ? colors[index] : pathColor;
            const width = pathWidth;

            g.append("path")
                .attr("d", line(points.map(({ x, y }) => [x, y]))) // Apply the curve path
                .style("fill", "none")
                .style("stroke", color)
                .attr("stroke-linecap", "round")
                .style("stroke-width", width);
        });
    }

    if (hideOriginalPaths) return;

    // Draw the original segments as lines
    segments.forEach(({ from, to, id }) => {
        const fromWaypoint = getWaypointById(from.waypointId)!;
        const toWaypoint = getWaypointById(to.waypointId)!;

        const fromPoint = map.latLngToLayerPoint(new L.LatLng(fromWaypoint.lat, fromWaypoint.lng));
        const toPoint = map.latLngToLayerPoint(new L.LatLng(toWaypoint.lat, toWaypoint.lng));

        g.append("line")
            .attr("x1", fromPoint.x)
            .attr("y1", fromPoint.y)
            .attr("x2", toPoint.x)
            .attr("y2", toPoint.y)
            .style("stroke", "black")
            .attr("stroke-linecap", "round")
            .attr("opacity", 0.5)
            .style("cursor", "pointer")
            .style("stroke-width", 2)
            .on("click",
                (event: MouseEvent) => {
                    event.stopPropagation();
                    selectSegment(id);
                })
    });
}

function getPaths(segments: PathSegment[]): number[][] {
    // Create a map to store connections between points
    const connections: Record<number, number[]> = {};
    segments.forEach((segment) => {
        const start = segment.from.waypointId;
        const end = segment.to.waypointId;
        if (!connections[start]) connections[start] = [];
        if (!connections[end]) connections[end] = [];
        connections[start].push(end);
        connections[end].push(start);
    });

    const visited: Set<number> = new Set();
    const paths: number[][] = [];

    // Function to trace a single path starting from a given point
    function tracePath(start: number, isClosedPath: boolean): number[] {
        const path: number[] = [start];
        visited.add(start);
        let currentPoint = start;

        while (true) {
            // Find the next point that hasn't been visited
            let nextPoint: number | undefined = undefined;
            for (const neighbor of connections[currentPoint]) {
                if (!visited.has(neighbor)) {
                    nextPoint = neighbor;
                    break;
                }
            }

            if (nextPoint === undefined) {
                // If there's no unvisited neighbor, this path is complete
                break;
            }

            path.push(nextPoint);
            visited.add(nextPoint);
            currentPoint = nextPoint;
        }

        // Handle the closed path check
        if (isClosedPath && connections[path[0]].includes(path[path.length - 1]) && path.length > 2) {
            path.push(path[0]);  // Close the loop
        }

        return path;
    }

    // Iterate over all points and trace the paths
    for (const point of Object.keys(connections)) {
        const pointId = Number(point);
        if (!visited.has(pointId)) {
            const path = tracePath(pointId, true);  // Assume it's a closed path by default
            paths.push(path);
        }
    }

    const pathsWithOpenEnds = paths.filter(path => path[0] !== path[path.length - 1] || path.length === 1);
    for (const path of pathsWithOpenEnds) {
        // check if the open end is connected to another path
        const start = path[0];
        const end = path[path.length - 1];
        const startConnections = connections[start] || [];
        const endConnections = connections[end] || [];

        // add all connections to the front / back of the path
        if (startConnections.length > 1) {
            path.unshift(startConnections[1]);
        }

        if (endConnections.length > 1) {
            path.push(endConnections[1]);
        }

        if (path.length === 1) {
            path.push(connections[start][0]);
        }
    }

    return paths;
}