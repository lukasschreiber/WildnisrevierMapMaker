import * as d3 from "d3";
import { RenderPathOptions } from "../types";
import { toTuples } from "../svg/geometry";
import { styleStroke } from "../svg/attrs";
import { renderOriginalSegments } from "./originalSegments";

export function renderPath({
    g,
    map,
    path,
    points,
    hideOriginalPaths,
    hideFancyPaths,
    getWaypointById,
    selectSegment,
}: RenderPathOptions) {
    const curve = d3.curveCardinal.tension(path.tension);
    const line = d3.line<[number, number]>()
        .curve(curve)
        .x((d) => d[0])
        .y((d) => d[1]);

    const group = g.append("g").attr("id", `path-${path.id}`);
    const pathData = line(toTuples(points));

    if (!hideFancyPaths && pathData) {
        if (path.outlineWidth > 0) {
            styleStroke(
                group.append("path").attr("d", pathData),
                path.outlineColor,
                path.outlineWidth * 2 + path.width,
                { linecap: path.linecap ?? "round" },
            );
        }

        const fill = styleStroke(
            group.append("path").attr("d", pathData),
            path.color,
            path.width,
            {
                linecap: path.linecap ?? "round",
                opacity: path.opacity ?? 1,
            },
        );

        if (path.style === "dashed") {
            fill.style("stroke-dasharray", path.dasharray ?? "5, 11");
        } else if (path.style === "dotted") {
            fill.style("stroke-dasharray", path.dasharray ?? "1, 11");
        }
    }

    if (!hideOriginalPaths) {
        renderOriginalSegments({
            g: group,
            map,
            segments: path.segments,
            getWaypointById,
            selectSegment,
        });
    }

    return group;
}
