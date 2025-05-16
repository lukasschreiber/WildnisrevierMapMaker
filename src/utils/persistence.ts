import { getPaths } from "../renderer/renderSegments";
import { WaypointGroup } from "../stores/useGroups";
import { PathSegment, Path } from "../stores/usePaths";
import { Shape } from "../stores/useShapes";
import { Waypoint } from "../stores/useWaypoints";
import { WaypointType } from "../stores/useWaypointTypes";

export interface WMAPFormatContent {
    waypoints: Waypoint[];
    waypointTypes: Record<number, WaypointType>;
    paths: Path[];
    // Should not use the legacy segments property
    segments?: PathSegment[];
    shapes: Shape[];
    groups: WaypointGroup[];
}

export const WMAPFileExtension = ".wmap";

export function downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export function exportAndDownloadWMAPFile(content: WMAPFormatContent) {
    const jsonContent = JSON.stringify(content, null, 2);
    const fileName = `export-${new Date().toISOString()}${WMAPFileExtension}`;
    downloadFile(jsonContent, fileName, "application/json");
}

export function parseWMAPFile(content: string): WMAPFormatContent {
    try {
        const data = JSON.parse(content);
        if (!data.waypoints || !data.waypointTypes || (!data.paths && !data.segments) || !data.shapes || !data.groups) {
            throw new Error("Invalid WMAP file format");
        }

        if (data.segments) {
            console.warn("The 'segments' property is deprecated. Use 'paths' instead.");
            // If segments are present, we create one path including all segments
            const rawPaths = getPaths(data.segments);
            const startId = 9999999

            rawPaths.map((rawPath, index) => {
                const path: Path = {
                    id: startId + index,
                    name: `Path ${index + 1}`,
                    color: "#ffffff",
                    outlineWidth: 1,
                    outlineColor: "#000000",
                    width: 5,
                    tension: 0.5,
                    hidden: false,
                    segments: [],
                };

                const segments: PathSegment[] = []
                for (let i = 0; i < rawPath.length - 1; i++) {
                    segments.push({id: i + startId + index, from: {waypointId: rawPath[i]}, to: {waypointId: rawPath[i + 1]}});
                }

                path.segments = segments;

                if (!data.paths || data.paths.length === 0) {
                    data.paths = [path];
                } else {
                    data.paths.push(path);
                }
            })

            // const newPath: Path = {
            //     id: 9999999,
            //     name: "All Segments",
            //     color: "#000000",
            //     segments: segments,
            // };
            // if (!data.paths || data.paths.length === 0) {
            //     data.paths = [newPath];
            // } else {
            //     data.paths.push(newPath);
            // }
        }

        if (Array.isArray(data.waypointTypes)) {
            // Convert array to object where the id is the key
            data.waypointTypes = data.waypointTypes.reduce((acc: Record<number, WaypointType>, type: WaypointType) => {
                acc[type.id] = type;
                return acc;
            }, {});
        }

        return data as WMAPFormatContent;
    } catch (error) {
        throw new Error("Failed to parse WMAP file: " + error);
    }
}