import L from 'leaflet';
import { svgPathProperties } from 'svg-path-properties';

export function approximatePathArea(map: L.Map, pathData: string, samplePoints = 500): number {
    const props = new svgPathProperties(pathData);
    const length = props.getTotalLength();

    const points = [];
    for (let i = 0; i <= samplePoints; i++) {
        const point = props.getPointAtLength((i / samplePoints) * length);
        points.push(map.layerPointToLatLng([point.x, point.y]));
    }

    return shoelaceArea(map, points);
}


function shoelaceArea(map: L.Map, latLngs: L.LatLng[]): number {
    let area = 0;
    const n = latLngs.length;

    const projected = latLngs.map(p => map.options.crs!.project(p));

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += projected[i].x * projected[j].y;
        area -= projected[j].x * projected[i].y;
    }

    return Math.abs(area / 2);
}