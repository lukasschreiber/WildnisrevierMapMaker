import * as d3 from "d3";
import { RenderGroupSelection } from "../types";

export function applyShapeTexture({
    group,
    path,
    texture,
    color,
    patternId,
}: {
    group: RenderGroupSelection;
    path: d3.Selection<SVGPathElement, unknown, null, undefined>;
    texture: string | undefined;
    color: string;
    patternId: string;
}) {
    if (texture === "gradient") {
        const gradient = group.append("defs")
            .append("linearGradient")
            .attr("id", patternId);

        gradient.selectAll("stop")
            .data([
                { offset: "0%", color: d3.rgb(color).darker(2) },
                { offset: "100%", color: d3.rgb(color).brighter(2) },
            ])
            .enter()
            .append("stop")
            .attr("offset", (d) => d.offset)
            .attr("stop-color", (d) => d.color.formatHex());

        path.style("fill", `url(#${patternId})`);
        return;
    }

    if (texture === "lines") {
        const pattern = appendPattern(group, patternId, 8, 8);

        pattern.append("path")
            .attr("d", "M 0,0 L 8,8 M -8,0 L 0,8 M 0,-8 L 8,0")
            .style("stroke", color)
            .style("stroke-width", 1);

        path.style("fill", `url(#${patternId})`);
        return;
    }

    if (texture === "dots") {
        const pattern = appendPattern(group, patternId, 4, 4);

        pattern.append("circle")
            .attr("cx", 2)
            .attr("cy", 2)
            .attr("r", 1)
            .style("fill", color);

        path.style("fill", `url(#${patternId})`);
        return;
    }

    if (texture === "checkered") {
        const pattern = appendPattern(group, patternId, 8, 8);

        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 8)
            .attr("height", 8)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 1);

        path.style("fill", `url(#${patternId})`);
        return;
    }

    if (texture === "chessboard") {
        const patternSize = 10;
        const pattern = appendPattern(group, patternId, patternSize * 2, patternSize * 2);

        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", patternSize * 2)
            .attr("height", patternSize * 2)
            .style("fill", d3.rgb(color).brighter(1).formatHex());

        pattern.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", patternSize)
            .attr("height", patternSize)
            .style("fill", d3.rgb(color).darker(1).formatHex());

        pattern.append("rect")
            .attr("x", patternSize)
            .attr("y", patternSize)
            .attr("width", patternSize)
            .attr("height", patternSize)
            .style("fill", d3.rgb(color).darker(1).formatHex());

        path.style("fill", `url(#${patternId})`);
        return;
    }

    if (texture === "crosses") {
        const patternSize = 12;
        const crossSize = 4;
        const pattern = appendPattern(group, patternId, patternSize, patternSize);

        pattern.append("line")
            .attr("x1", patternSize / 2)
            .attr("y1", patternSize / 2 - crossSize)
            .attr("x2", patternSize / 2)
            .attr("y2", patternSize / 2 + crossSize)
            .style("stroke", color)
            .style("stroke-width", 1);

        pattern.append("line")
            .attr("x1", patternSize / 2 - crossSize)
            .attr("y1", patternSize / 2)
            .attr("x2", patternSize / 2 + crossSize)
            .attr("y2", patternSize / 2)
            .style("stroke", d3.rgb(color).darker(1.5).formatHex())
            .style("stroke-width", 1);

        path.style("fill", `url(#${patternId})`);
        return;
    }

    if (texture === "solid") {
        path.style("fill", color);
        return;
    }

    if (texture === "none") {
        path.style("fill", "none");
    }
}

function appendPattern(group: RenderGroupSelection, id: string, width: number, height: number) {
    return group.append("defs")
        .append("pattern")
        .attr("id", id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", width)
        .attr("height", height);
}
