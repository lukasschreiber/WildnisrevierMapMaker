import { WaypointGroup } from "../stores/useGroups";
import { PathSegment } from "../stores/usePaths";
import { Shape } from "../stores/useShapes";
import { Waypoint } from "../stores/useWaypoints";
import { WaypointType } from "../stores/useWaypointTypes";

export interface WMAPFormatContent {
    waypoints: Waypoint[];
    waypointTypes: Record<number, WaypointType>;
    segments: PathSegment[];
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
        if (!data.waypoints || !data.waypointTypes || !data.segments || !data.shapes || !data.groups) {
            throw new Error("Invalid WMAP file format");
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