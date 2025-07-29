import { useCallback, useEffect, useRef } from "react";
import { useWaypointStore } from "../stores/useWaypoints";
import { usePathStore } from "../stores/usePaths";
import { useMap } from "../context/MapContext";
import { useLocation, useNavigate } from "react-router";

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
    const paths = usePathStore((state) => state.paths);
    const deselectWaypoint = useWaypointStore((state) => state.deselectWaypoint);
    const selectWaypoint = useWaypointStore((state) => state.selectWaypoint);
    const navigate = useNavigate();
    const location = useLocation();
    const lastSyncedId = useRef<number | null>(null);

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
                paths.forEach((path) => {
                    path.segments.forEach((segment) => {
                        if (segment.from.waypointId === selectedId || segment.to.waypointId === selectedId) {
                            deleteSegment(segment.id);
                        }
                    });
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

    useEffect(() => {
        // if the URL has the route /waypoint/:id, extract the id and select the waypoint
        if (!location.pathname.startsWith("/waypoint/")) {
            deselectWaypoint();
            return;
        }
        const param = location.pathname.split("/").pop();
        const id = param ? parseInt(param, 10) : null;

        if (id !== lastSyncedId.current) {
            if (id !== null && !isNaN(id)) {
                selectWaypoint(id);
                const waypoint = waypoints.find((wp) => wp.id === id);
                if (!waypoint) return;
                map.flyTo([waypoint.lat, waypoint.lng], 20);
            } else {
                deselectWaypoint();
            }
            lastSyncedId.current = id;
        }
    }, [location.pathname]);

    useEffect(() => {
        if (selectedId !== lastSyncedId.current) {
            if (selectedId === null) {
                navigate("/");
            } else {
                navigate(`/waypoint/${selectedId}`);
            }
            lastSyncedId.current = selectedId;
        }
    }, [selectedId]);

    return null;
}
