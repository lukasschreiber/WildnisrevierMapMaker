import { useCallback, useEffect } from "react";
import { useMap } from "react-leaflet";
import { useWaypointStore } from "../stores/useWaypoints";
import { usePathStore } from "../stores/usePaths";

export function MapEventManager() {
    const map = useMap();
    const addMode = useWaypointStore((state) => state.addMode);
    const addPathMode = usePathStore((state) => state.addMode);
    const selectedId = useWaypointStore((state) => state.selectedId);
    const updateWaypointPosition = useWaypointStore((state) => state.updateWaypointPosition);
    const deleteWaypoint = useWaypointStore((state) => state.deleteWaypoint);
    const deleteSegment = usePathStore((state) => state.deleteSegment);
    const isDeletable = useWaypointStore((state) => state.isDeletable);
    const waypoints = useWaypointStore((state) => state.waypoints);
    const addWaypoint = useWaypointStore((state) => state.addWaypoint);
    const cancelSegmentConnection = usePathStore((state) => state.cancelSegmentConnection);
    const segments = usePathStore((state) => state.segments);
    const deselectWaypoint = useWaypointStore((state) => state.deselectWaypoint);

    const onMapClick = useCallback(
        (e: L.LeafletMouseEvent) => {
            if ((e.originalEvent.target as HTMLElement)?.closest("#menu")) return; // Ignore clicks on the menu
            if (addMode && selectedId === null) {
                addWaypoint(e.latlng.lat, e.latlng.lng);
            } else if (addPathMode) {
                cancelSegmentConnection();
            } else {
                deselectWaypoint();
            }
        },
        [selectedId, addMode, addPathMode, cancelSegmentConnection, deselectWaypoint]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (selectedId === null) return;

            const step = 0.000001;

            // Update waypoint position with arrow keys
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                for (const wp of waypoints) {
                    if (wp.id !== selectedId) continue;
                    let { lat, lng } = wp;

                    switch (e.key) {
                        case "ArrowUp":
                            lat += step;
                            break;
                        case "ArrowDown":
                            lat -= step;
                            break;
                        case "ArrowLeft":
                            lng -= step;
                            break;
                        case "ArrowRight":
                            lng += step;
                            break;
                        default:
                            return wp;
                    }

                    updateWaypointPosition(wp.id, lat, lng); // Update the waypoint in the context
                    break; // Exit the loop after updating the selected waypoint
                }
            }

            // Delete selected waypoint on "Delete" key press
            if (e.key === "Delete" && selectedId !== null) {
                if (!isDeletable(selectedId)) return;
                const confirmed = window.confirm("Are you sure you want to delete this waypoint?");
                if (!confirmed) return;
                segments.forEach((segment) => {
                    if (segment.from.waypointId === selectedId || segment.to.waypointId === selectedId) {
                        deleteSegment(segment.id);
                    }
                });
                deleteWaypoint(selectedId); // Delete the waypoint from the context
                deselectWaypoint();
            }
        },
        [isDeletable, selectedId, waypoints, deleteWaypoint, updateWaypointPosition, deleteSegment, deselectWaypoint]
    );

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);

    useEffect(() => {
        map.on("click", onMapClick);
        return () => {
            map.off("click", onMapClick);
        };
    }, [map, onMapClick]);

    return null;
}