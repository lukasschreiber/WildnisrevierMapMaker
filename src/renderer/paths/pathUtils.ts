import { Path } from "../../stores/usePaths";

export function getPathWaypointIds(path: Path): number[] {
    if (path.segments.length === 0) return [];

    return [path.segments[0].from.waypointId, ...path.segments.map((segment) => segment.to.waypointId)];
}

export function getPathStartWaypointId(path: Path): number | null {
    if (path.segments.length === 0) return null;
    return path.segments[0].from.waypointId;
}

export function getPathEndWaypointId(path: Path): number | null {
    if (path.segments.length === 0) return null;
    return path.segments[path.segments.length - 1].to.waypointId;
}

export function isClosedPath(path: Path): boolean {
    const start = getPathStartWaypointId(path);
    const end = getPathEndWaypointId(path);

    return path.segments.length >= 3 && start !== null && start === end;
}

export function pathContainsWaypoint(path: Path, waypointId: number): boolean {
    return getPathWaypointIds(path).includes(waypointId);
}

export function findPathsContainingWaypoint(paths: Path[], waypointId: number): Path[] {
    return paths.filter((path) => pathContainsWaypoint(path, waypointId));
}

export function findExtendablePathFromWaypoint(paths: Path[], waypointId: number): Path | null {
    const containingPaths = findPathsContainingWaypoint(paths, waypointId);

    if (containingPaths.length !== 1) return null;

    const path = containingPaths[0];

    if (isClosedPath(path)) return null;

    return getPathEndWaypointId(path) === waypointId ? path : null;
}

export function getOrderedWaypointIdsFromPath(path: Path): number[] {
    if (path.segments.length === 0) return [];

    return [path.segments[0].from.waypointId, ...path.segments.map((segment) => segment.to.waypointId)];
}

export function canAppendToPath(path: Path, fromWaypointId: number, toWaypointId: number): boolean {
    const start = getPathStartWaypointId(path);
    const end = getPathEndWaypointId(path);

    if (end !== fromWaypointId) return false;

    // Allow normal extension to a waypoint not already in this path.
    if (!pathContainsWaypoint(path, toWaypointId)) {
        return true;
    }

    // Allow closing the path back to its own start.
    if (start !== null && toWaypointId === start && path.segments.length >= 2) {
        return true;
    }

    // Disallow connecting to an interior waypoint of the same path.
    return false;
}
