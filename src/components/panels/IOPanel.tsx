import { useCallback } from "react";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointStore } from "../../stores/useWaypoints";
import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";
import { useSettingsStore } from "../../stores/useSettings";
import { useWaypointGroupStore } from "../../stores/useGroups";
import { downloadFile, exportAndDownloadWMAPFile, parseWMAPFile } from "../../utils/persistence";

export function IOPanel() {
    const waypoints = useWaypointStore((state) => state.waypoints);
    const setWaypoints = useWaypointStore((state) => state.setWaypoints);
    const types = useWaypointTypeStore((state) => state.types);
    const setTypes = useWaypointTypeStore((state) => state.setTypes);
    const segments = usePathStore((state) => state.segments);
    const setSegments = usePathStore((state) => state.setSegments);
    const shapes = useShapeStore((state) => state.shapes);
    const setShapes = useShapeStore((state) => state.setShapes);
    const groups = useWaypointGroupStore((state) => state.waypointGroups);
    const setGroups = useWaypointGroupStore((state) => state.setWaypointGroups);
    // TODO: persist groups
    const hideArrowsInExport = useSettingsStore((state) => state.settings.hideArrowsInExport);
    const hideDistancesInExport = useSettingsStore((state) => state.settings.hideDistancesInExport);
    const hideOriginalPathsInExport = useSettingsStore((state) => state.settings.hideOriginalPathsInExport);
    const hideHiddenWaypointsInExport = useSettingsStore((state) => state.settings.hideHiddenWaypointsInExport);

    

    const exportJson = useCallback(() => {
        exportAndDownloadWMAPFile({
            waypoints,
            waypointTypes: types,
            segments,
            shapes,
            groups,
        });
    }, [waypoints, segments, types, shapes, groups]);

    const exportSvg = useCallback(() => {
        const svgContentGroups = document.querySelectorAll<SVGGElement>(".waypoint-overlay");
        if (!svgContentGroups || svgContentGroups.length === 0) {
            alert("No SVG content found");
            return;
        }
    
        // Combine all SVG groups into one <g>
        const svgContentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgContentGroups.forEach((group) => {
            const clonedGroup = group.cloneNode(true);
            svgContentGroup.appendChild(clonedGroup);
        });
    
        // Create a temporary SVG to compute the bounding box
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        tempSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        tempSvg.setAttribute("style", "position: absolute; top: -9999px; left: -9999px; visibility: hidden;");
        tempSvg.appendChild(svgContentGroup);
        document.body.appendChild(tempSvg);
    
        const bbox = svgContentGroup.getBBox();
        const svgWidth = bbox.width;
        const svgHeight = bbox.height;
        const svgX = bbox.x;
        const svgY = bbox.y;
    
        // Remove the temporary SVG
        tempSvg.remove();
    
        // Now create the actual exportable SVG
        const svgContent = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgContent.setAttribute("width", `${svgWidth}`);
        svgContent.setAttribute("height", `${svgHeight}`);
        svgContent.setAttribute("viewBox", `${svgX} ${svgY} ${svgWidth} ${svgHeight}`);
        svgContent.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgContent.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        svgContent.setAttribute("style", "background: white;");
        svgContent.setAttribute("preserveAspectRatio", "xMinYMin meet");
        svgContent.setAttribute("version", "1.1");
    
        // Clone the original group again (to avoid using the DOM-modified one)
        const finalGroup = svgContentGroup.cloneNode(true);
        svgContent.appendChild(finalGroup);
    
        // Apply hiding rules
        const kindsToHide = [];
        if (hideArrowsInExport) kindsToHide.push("arrow");
        if (hideDistancesInExport) kindsToHide.push("distance-label");
        if (hideOriginalPathsInExport) kindsToHide.push("original-path");
        if (hideHiddenWaypointsInExport) kindsToHide.push("hidden-marker");
    
        for (const kind of kindsToHide) {
            svgContent.querySelectorAll(`*[data-kind="${kind}"]`).forEach((el) => {
                el.setAttribute("visibility", "hidden");
            });
        }
    
        // Serialize and download
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgContent);
        downloadFile(svgString, `export-${new Date().toISOString()}.svg`, "image/svg+xml");
    }, [hideArrowsInExport, hideDistancesInExport, hideHiddenWaypointsInExport, hideOriginalPathsInExport]);
    

    const importJson = useCallback((file: File) => {
        if (!confirm("Are you sure you want to import this file? This will overwrite your current data.")) {
            return;
        }
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === "string") {
                const parsed = parseWMAPFile(content);
                setTypes(parsed.waypointTypes);
                setWaypoints(parsed.waypoints);
                setSegments(parsed.segments);
                setShapes(parsed.shapes);
                setGroups(parsed.groups);
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
                        setShapes([]);
                        setTypes({
                            1: {
                                id: 1,
                                name: "Default",
                                icon: "circle",
                                color: "#FF0000",
                                hidden: false,
                                hasTwoColors: false,
                            },
                            2: {
                                id: 2,
                                name: "Custom",
                                icon: "square",
                                color: "#00FF00",
                                hidden: false,
                                hasTwoColors: false,
                            },
                        });
                        setGroups([]);
                    }
                }}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-red-500"
            >
                Reset All Data
            </button>
        </div>
    );
}
