import * as d3 from "d3";
import { RenderPathOptions } from "../types";
import { toTuples } from "../svg/geometry";
import { styleStroke } from "../svg/attrs";
import { renderOriginalSegments } from "./originalSegments";
import { isClosedPath } from "./pathUtils";

export function renderPath({
    g,
    map,
    path,
    points,
    hideOriginalPaths,
    hideFancyPaths,
    getWaypointById,
    selectSegment,
    selected,
}: RenderPathOptions) {
    const closed = isClosedPath(path);

    const curve = closed ? d3.curveCardinalClosed.tension(path.tension) : d3.curveCardinal.tension(path.tension);

    const line = d3
        .line<[number, number]>()
        .curve(curve)
        .x((d) => d[0])
        .y((d) => d[1]);

    const group = g.append("g").attr("id", `path-${path.id}`);
    const renderPoints = closed ? points.slice(0, -1) : points;
    const pathData = line(toTuples(renderPoints));

    if (!hideFancyPaths && pathData) {
        if (selected) {
            const selectionWidth = path.width + path.outlineWidth * 2;

            group
                .append("path")
                .attr("d", pathData)
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-opacity", 0.5)
                .attr("stroke-width", selectionWidth + 10)
                .attr("stroke-linecap", path.linecap ?? "round")
                .attr("stroke-linejoin", "round")
                .style("pointer-events", "none")
                .classed("path-selection-outer", true);
        }

        if (path.outlineWidth > 0) {
            styleStroke(
                group.append("path").attr("d", pathData),
                path.outlineColor,
                path.outlineWidth * 2 + path.width,
                { linecap: path.linecap ?? "round" },
            );
        }

        const fill = styleStroke(group.append("path").attr("d", pathData), path.color, path.width, {
            linecap: path.linecap ?? "round",
            opacity: path.opacity ?? 1,
        });

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

    group.selectAll("path").style("pointer-events", "stroke").style("cursor", "pointer");

    return group;
}
