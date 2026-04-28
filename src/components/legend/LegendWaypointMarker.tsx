import { useEffect, useRef } from "react";
import { WaypointType } from "../../stores/useWaypointTypes";
import * as d3 from "d3";
import { renderMarker } from "../../renderer/renderMarkers";

export function LegendWaypointMarker(props: {
    type: WaypointType;
    radius?: number;
    borderWidth?: number;
    borderColor?: string;
}) {
    const containerRef = useRef<SVGSVGElement>(null);
    const { type, radius, borderWidth, borderColor } = props;
    const defaultRadius = 10;
    useEffect(() => {
        if (containerRef.current && type) {
            d3.select(containerRef.current).selectAll("*").remove(); // Clear previous icons
            const g = d3.select(containerRef.current).append("g").attr("class", "waypoint-icon");
            renderMarker(
                g,
                {
                    x: (radius ?? defaultRadius) + (borderWidth || 0) + 1,
                    y: (radius ?? defaultRadius) + (borderWidth || 0) + 1,
                },
                type.additionalText ? "1" : undefined,
                false,
                false,
                radius ?? defaultRadius,
                type,
                undefined,
                borderWidth ?? 0,
                borderColor ?? "black",
                borderWidth ? true : false,
                true
            );
        }
    }, [containerRef, type, radius, borderWidth, borderColor]);
    return (
        <svg
            className="legend-waypoint-icon"
            ref={containerRef}
            width={(radius ?? defaultRadius) * 2 + 2 * (borderWidth || 0) + 2}
            height={(radius ?? defaultRadius) * 2 + 2 * (borderWidth || 0) + 2}
        ></svg>
    );
}
