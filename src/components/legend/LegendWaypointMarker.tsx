import { useEffect, useRef } from "react";
import { WaypointType } from "../../stores/useWaypointTypes";
import * as d3 from "d3";
import { renderMarker } from "../../renderer/markers/renderMarker";

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
            renderMarker({
                g,
                point: {
                    x: (radius ?? defaultRadius) + (borderWidth || 0) + 1,
                    y: (radius ?? defaultRadius) + (borderWidth || 0) + 1,
                },
                additionalText: type.additionalText ? "1" : undefined,
                hidden: false,
                radius: radius ?? defaultRadius,
                type,
                group: undefined,
                borderWidth: borderWidth ?? 0,
                borderColor: borderColor ?? "black",
                showBorder: borderWidth ? true : false,
                visualizeHiddenItems: true,
            });
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
