import * as d3 from "d3";
import L from "leaflet";
import { Waypoint } from "../../stores/useWaypoints";
import { RenderPoint } from "../types";

export function toTuple(point: RenderPoint): [number, number] {
    return [point.x, point.y];
}

export function toTuples(points: RenderPoint[]): [number, number][] {
    return points.map(toTuple);
}

export function layerPointFromWaypoint(map: L.Map, waypoint: Waypoint): L.Point {
    return map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
}

export function dedupePoints(points: RenderPoint[]): RenderPoint[] {
    return Array.from(new Map(points.map((p) => [`${p.x},${p.y}`, p])).values());
}

export function midpoint(points: RenderPoint[]): RenderPoint {
    return {
        x: d3.mean(points, (p) => p.x) ?? 0,
        y: d3.mean(points, (p) => p.y) ?? 0,
    };
}

export function distance(a: RenderPoint, b: RenderPoint): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
