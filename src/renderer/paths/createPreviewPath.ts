import { Path } from "../../stores/usePaths";

export function createPreviewPath(basePath: Path | null, fromWaypointId: number, toWaypointId: number): Path {
    const previewSegment = {
        id: -1,
        from: { waypointId: fromWaypointId },
        to: { waypointId: toWaypointId },
    };

    if (basePath) {
        return {
            ...basePath,
            id: -999,
            hidden: false,
            opacity: 0.75,
            segments: [...basePath.segments, previewSegment],
        };
    }

    return {
        id: -999,
        name: "Preview path",
        color: "#000000",
        outlineWidth: 0,
        outlineColor: "#000000",
        width: 5,
        tension: 0.5,
        segments: [previewSegment],
        hidden: false,
        opacity: 0.75,
        linecap: "round",
        style: "solid",
    };
}
