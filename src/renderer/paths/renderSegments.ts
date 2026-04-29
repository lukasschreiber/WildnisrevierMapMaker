import L from "leaflet";
import * as d3 from "d3";
import { RenderSegmentsOptions, AnyD3Selection } from "../types";
import { styleStroke } from "../svg/attrs";
import { getPaths } from "./pathGraph";
import { renderOriginalSegments } from "./originalSegments";

const UNIQUE_PATH_COLORS = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#000080",
    "#808000",
    "#800000",
    "#808080",
];

export function renderSegments({
    g,
    map,
    segments,
    getWaypointById,
    useUniqueColors,
    pathWidth,
    pathColor,
    pathOutlineWidth,
    pathOutlineColor,
    hideOriginalPaths,
    hideFancyPaths,
    tension,
    selectSegment,
}: RenderSegmentsOptions) {
    const renderedElements: AnyD3Selection[] = [];
    const paths = getPaths(segments);
    const curve = d3.curveCardinal.tension(tension);
    const line = d3.line<[number, number]>()
        .curve(curve)
        .x((d) => d[0])
        .y((d) => d[1]);

    if (!hideFancyPaths) {
        paths.forEach((path, index) => {
            const points = path.flatMap((node) => {
                const waypoint = getWaypointById(node);
                if (!waypoint) return [];

                const point = map.latLngToLayerPoint(new L.LatLng(waypoint.lat, waypoint.lng));
                return [[point.x, point.y] as [number, number]];
            });

            const pathData = line(points);
            if (!pathData) return;

            const color = useUniqueColors
                ? UNIQUE_PATH_COLORS[index % UNIQUE_PATH_COLORS.length]
                : pathColor;

            if (pathOutlineWidth > 0) {
                renderedElements.push(styleStroke(
                    g.append("path").attr("d", pathData),
                    pathOutlineColor,
                    pathOutlineWidth * 2 + pathWidth,
                ));
            }

            renderedElements.push(styleStroke(
                g.append("path").attr("d", pathData),
                color,
                pathWidth,
            ));
        });
    }

    if (!hideOriginalPaths) {
        renderedElements.push(...renderOriginalSegments({
            g,
            map,
            segments,
            getWaypointById,
            selectSegment,
        }));
    }

    return renderedElements;
}

export { getPaths };
