import { CommonMarkerOptions, applyMarkerCommonAttrs } from "./markerCommon";
import { createCrossPath, createDiamondPath, createStarPath } from "./markerPaths";

export type MarkerShapeName = "circle" | "square" | "triangle" | "star" | "cross" | "diamond";

export type MarkerShapeOptions = Omit<CommonMarkerOptions, "target"> & {
    radius: number;
};

export const markerShapeRenderers: Record<MarkerShapeName, (options: MarkerShapeOptions) => ReturnType<typeof applyMarkerCommonAttrs>> = {
    circle: (options) => applyMarkerCommonAttrs({
        ...options,
        target: options.shapeG.append("circle").attr("r", options.radius),
    }),

    square: (options) => {
        const side = options.radius * Math.SQRT2;
        return applyMarkerCommonAttrs({
            ...options,
            target: options.shapeG.append("rect")
                .attr("x", -side / 2)
                .attr("y", -side / 2)
                .attr("width", side)
                .attr("height", side),
        });
    },

    triangle: (options) => {
        const radius = options.radius;
        const triPath = [
            [0, -radius],
            [radius * Math.sin(Math.PI / 3), radius / 2],
            [-radius * Math.sin(Math.PI / 3), radius / 2],
        ].map((p) => p.join(",")).join(" ");

        return applyMarkerCommonAttrs({
            ...options,
            target: options.shapeG.append("polygon").attr("points", triPath),
        });
    },

    star: (options) => applyMarkerCommonAttrs({
        ...options,
        target: options.shapeG.append("polygon").attr("points", createStarPath(options.radius)),
    }),

    cross: (options) => applyMarkerCommonAttrs({
        ...options,
        target: options.shapeG.append("path")
            .attr("d", createCrossPath(options.radius))
            .style("pointer-events", "all"),
    }),

    diamond: (options) => applyMarkerCommonAttrs({
        ...options,
        target: options.shapeG.append("polygon").attr("points", createDiamondPath(options.radius)),
    }),
};

export function isBuiltInMarkerShape(icon: string | undefined): icon is MarkerShapeName {
    return Boolean(icon && icon in markerShapeRenderers);
}
