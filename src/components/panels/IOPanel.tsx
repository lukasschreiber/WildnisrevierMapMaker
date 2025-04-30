import { useCallback } from "react";
import { useSettings } from "../../settings/useSettings";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointStore } from "../../stores/useWaypoints";
import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";

export function IOPanel() {
    const waypoints = useWaypointStore((state) => state.waypoints);
    const setWaypoints = useWaypointStore((state) => state.setWaypoints);
    const types = useWaypointTypeStore((state) => state.types);
    const setTypes = useWaypointTypeStore((state) => state.setTypes);
    const segments = usePathStore((state) => state.segments);
    const setSegments = usePathStore((state) => state.setSegments);
    const shapes = useShapeStore((state) => state.shapes);
    const setShapes = useShapeStore((state) => state.setShapes);
    // TODO: persist groups
    const { settings } = useSettings();

    const downloadFile = (content: string, fileName: string, mimeType: string) => {
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

    const exportJson = useCallback(() => {
        const data = {
            waypoints,
            types,
            segments,
            shapes,
        };

        const json = JSON.stringify(data, null, 2);
        const name = `export-${new Date().toISOString()}.wmap`;
        downloadFile(json, name, "application/json");
    }, [waypoints, segments, types, shapes]);

    const exportSvg = useCallback(() => {
        const svgContentGroup = document.querySelector<SVGGElement>("g#waypoint-overlay");
        if (!svgContentGroup) {
            alert("No SVG content found");
            return;
        }

        // Get bounding box and calculate the position
        const bbox = svgContentGroup.getBBox();
        const svgWidth = bbox.width;
        const svgHeight = bbox.height;
        const svgX = bbox.x;
        const svgY = bbox.y;

        // Create a new SVG element
        const svgContent = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        svgContent.setAttribute("width", `${svgWidth}`);
        svgContent.setAttribute("height", `${svgHeight}`);
        svgContent.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgContent.setAttribute("viewBox", `${svgX} ${svgY} ${svgWidth} ${svgHeight}`);
        svgContent.setAttribute("style", "background: white;");
        svgContent.setAttribute("preserveAspectRatio", "xMinYMin meet");
        svgContent.setAttribute("version", "1.1");
        svgContent.setAttribute("id", "exported-svg");
        svgContent.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        // Clone the group element and append it to the new SVG
        const clonedGroup = svgContentGroup.cloneNode(true);
        svgContent.appendChild(clonedGroup);

        const kindsToHide = [];
        if (settings.hideArrowsInExport) {
            kindsToHide.push("arrow");
        }

        if (settings.hideDistancesInExport) {
            kindsToHide.push("distance-label");
        }

        if (settings.hideOriginalPathsInExport) {
            kindsToHide.push("original-path");
        }

        if (settings.hideHiddenWaypointsInExport) {
            kindsToHide.push("hidden-marker");
        }

        for (const kind of kindsToHide) {
            svgContent.querySelectorAll(`*[data-kind="${kind}"]`).forEach((el) => {
                el.setAttribute("visibility", "hidden");
            });
        }

        // Use XMLSerializer to serialize the SVG content
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgContent);

        // Download the file
        downloadFile(svgString, `export-${new Date().toISOString()}.svg`, "image/svg+xml");

        // Remove the temporary SVG
        document.getElementById("exported-svg")?.remove();
    }, [
        settings.hideArrowsInExport,
        settings.hideDistancesInExport,
        settings.hideHiddenWaypointsInExport,
        settings.hideOriginalPathsInExport,
    ]);

    const importJson = useCallback((file: File) => {
        if (!confirm("Are you sure you want to import this file? This will overwrite your current data.")) {
            return;
        }
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === "string") {
                try {
                    const data = JSON.parse(content);
                    if (data.waypointTypes) {
                        setTypes(data.waypointTypes);
                    }
                    if (data.waypoints) {
                        setWaypoints(data.waypoints);
                    }
                    if (data.segments) {
                        setSegments(data.segments);
                    }
                    if (data.shapes) {
                        setShapes(data.shapes);
                    }
                } catch (error) {
                    alert("Error parsing JSON file");
                }
            }
        };
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">I/O</h2>
            <button onClick={() => exportJson()} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                Export JSON
            </button>

            <button onClick={() => exportSvg()} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                Export SVG
            </button>

            <div className="text-xs">Import JSON:</div>
            <input
                type="file"
                accept=".wmap"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        importJson(file);
                    }
                }}
                className="bg-black/50 p-1 rounded-md h-20 border-white border-1 border-dashed cursor-pointer hover:bg-black/30 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-black/50 disabled:bg-black/50 disabled:border-gray-500 disabled:text-gray-500"
            />
            <button
                onClick={() => {
                    if (confirm("Are you sure you want to reset all data?")) {
                        setWaypoints([]);
                        setSegments([]);
                    }
                }}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-red-500"
            >
                Reset All Data
            </button>
        </div>
    );
}
