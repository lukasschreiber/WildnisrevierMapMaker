import { PathSegment } from "../../stores/usePaths";

export function getPaths(segments: PathSegment[]): number[][] {
    const connections = buildConnections(segments);
    const visited = new Set<number>();
    const paths: number[][] = [];

    for (const point of Object.keys(connections)) {
        const pointId = Number(point);

        if (!visited.has(pointId)) {
            paths.push(tracePath(pointId, connections, visited, true));
        }
    }

    extendOpenPathEnds(paths, connections);
    return paths;
}

function buildConnections(segments: PathSegment[]): Record<number, number[]> {
    const connections: Record<number, number[]> = {};

    segments.forEach((segment) => {
        const start = segment.from.waypointId;
        const end = segment.to.waypointId;

        if (!connections[start]) connections[start] = [];
        if (!connections[end]) connections[end] = [];

        connections[start].push(end);
        connections[end].push(start);
    });

    return connections;
}

function tracePath(
    start: number,
    connections: Record<number, number[]>,
    visited: Set<number>,
    closePath: boolean,
): number[] {
    const path: number[] = [start];
    visited.add(start);

    let currentPoint = start;

    while (true) {
        const nextPoint = connections[currentPoint]?.find((neighbor) => !visited.has(neighbor));

        if (nextPoint === undefined) {
            break;
        }

        path.push(nextPoint);
        visited.add(nextPoint);
        currentPoint = nextPoint;
    }

    if (closePath && path.length > 2 && connections[path[0]]?.includes(path[path.length - 1])) {
        path.push(path[0]);
    }

    return path;
}

function extendOpenPathEnds(paths: number[][], connections: Record<number, number[]>) {
    const openPaths = paths.filter((path) => path[0] !== path[path.length - 1] || path.length === 1);

    for (const path of openPaths) {
        const start = path[0];
        const end = path[path.length - 1];
        const startConnections = connections[start] || [];
        const endConnections = connections[end] || [];

        if (path.length === 1) {
            const firstConnection = connections[start]?.[0];
            if (firstConnection !== undefined) {
                path.push(firstConnection);
            }
            continue;
        }

        if (startConnections.length > 1) {
            path.unshift(startConnections[1]);
        }

        if (endConnections.length > 1) {
            path.push(endConnections[1]);
        }
    }
}
