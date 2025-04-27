import { useCallback } from "react";
import { usePathContext } from "../context/PathContext";
import { useWaypointContext } from "../context/WaypointContext";
import { useWaypointTypeContext } from "../context/WaypointTypeContext";

export function ExportContainer() {
    const { waypoints, setWaypoints } = useWaypointContext();
    const { waypointTypes, setWaypointTypes } = useWaypointTypeContext();
    const { segments, setSegments } = usePathContext();

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
            waypointTypes,
            segments,
        };

        const json = JSON.stringify(data, null, 2);
        const name = `export-${new Date().toISOString()}.wmap`;
        downloadFile(json, name, "application/json");
    }, [waypoints, segments, waypointTypes]);

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

        svgContent.querySelectorAll("[data-hidden-on-export]").forEach((el) => {
            el.setAttribute("visibility", "hidden");
        });
    
        // Clone the group element and append it to the new SVG
        const clonedGroup = svgContentGroup.cloneNode(true);
        svgContent.appendChild(clonedGroup);
    
        // Use XMLSerializer to serialize the SVG content
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgContent);
    
        // Download the file
        downloadFile(svgString, `export-${new Date().toISOString()}.svg`, "image/svg+xml");
    
        // Remove the temporary SVG
        document.getElementById("exported-svg")?.remove();
    }, []);
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
                        setWaypointTypes(data.waypointTypes);
                    }
                    if (data.waypoints) {
                        setWaypoints(data.waypoints);
                    }
                    if (data.segments) {
                        setSegments(data.segments);
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
                className="bg-black/20 p-1 rounded-md"
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
