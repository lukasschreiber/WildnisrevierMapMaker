import { useEffect } from "react";
import { usePathContext } from "./context/PathContext";
import { useWaypointTypeContext } from "./context/WaypointTypeContext";
import { useWaypointContext } from "./context/WaypointContext";

export function FileLaunchHandler() {
    const { setWaypoints } = useWaypointContext();
    const { setWaypointTypes } = useWaypointTypeContext();
    const { setSegments } = usePathContext();

    useEffect(() => {
        console.log("FileLaunchHandler mounted");
        if ("launchQueue" in window) {
            (window as any).launchQueue.setConsumer(async (launchParams: any) => {
                if (!launchParams.files.length) return;
                console.log("FileLaunchHandler consumer called");
                console.log("launchParams", launchParams);
                
                for (const fileHandle of launchParams.files) {
                    if (fileHandle.kind === "file") {
                        const file = await fileHandle.getFile();
                        const text = await file.text();

                        if (!confirm(`Do you want to import '${file.name}'? This will overwrite your current data.`)) {
                            return;
                        }

                        try {
                            const data = JSON.parse(text);
                            if (data.waypointTypes) {
                                setWaypointTypes(data.waypointTypes);
                            }
                            if (data.waypoints) {
                                setWaypoints(data.waypoints);
                            }
                            if (data.segments) {
                                setSegments(data.segments);
                            }
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
