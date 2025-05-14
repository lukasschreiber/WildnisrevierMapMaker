import { useEffect } from "react";
import { useWaypointTypeStore } from "./stores/useWaypointTypes";
import { usePathStore } from "./stores/usePaths";
import { useWaypointStore } from "./stores/useWaypoints";
import { parseWMAPFile } from "./utils/persistence";
import { useWaypointGroupStore } from "./stores/useGroups";
import { useShapeStore } from "./stores/useShapes";

export function FileLaunchHandler() {
    const setTypes = useWaypointTypeStore((state) => state.setTypes);
    const setWaypoints = useWaypointStore((state) => state.setWaypoints);
    const setSegments = usePathStore((state) => state.setSegments);
    const setGroups = useWaypointGroupStore((state) => state.setWaypointGroups);
    const setShapes = useShapeStore((state) => state.setShapes);

    useEffect(() => {
        console.log("FileLaunchHandler mounted", "launchQueue" in window);

        if ("launchQueue" in window) {
            console.log("has launchQueue");
            (window.launchQueue as any).setConsumer(async (launchParams: any) => {
                if (!launchParams.files.length) return;
                console.log("launchParams", launchParams);

                // get the current file name from localstorag
                const currentFileName = localStorage.getItem("current-file-name") || "";
                const newFileName = launchParams.files[0].name;

                if (currentFileName === newFileName) {
                    console.log("File already loaded");
                    return;
                }

                for (const fileHandle of launchParams.files) {
                    if (fileHandle.kind === "file") {
                        const file = await fileHandle.getFile();
                        const text = await file.text();

                        if (!confirm(`Do you want to import '${file.name}'? This will overwrite your current data.`)) {
                            return;
                        }

                        localStorage.setItem("current-file-name", fileHandle.name);

                        try {
                            const parsed = parseWMAPFile(text);
                            setWaypoints(parsed.waypoints);
                            setTypes(parsed.waypointTypes);
                            setSegments(parsed.segments);
                            setGroups(parsed.groups);
                            setShapes(parsed.shapes);

                            alert(`Imported ${file.name} successfully.`);
                        } catch (error) {
                            alert("Failed to parse imported JSON file.");
                        }
                    }
                }
            });
        }
    }, []);

    return null;
}
