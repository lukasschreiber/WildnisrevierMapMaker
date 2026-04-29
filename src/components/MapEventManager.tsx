import { useCallback, useEffect, useRef } from "react";
import { useWaypointStore } from "../stores/useWaypoints";
import { usePathStore } from "../stores/usePaths";
import { useLocation, useNavigate } from "react-router";
import { useInteractionModeStore } from "../stores/useInteractionMode";
import { waypointActions } from "../domain/actions/waypoints";
import { useHistoryStore } from "../stores/useHistory";
import { useMap } from "../context/useMap";

function isTextInputTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (target.isContentEditable) {
        return true;
    }

    const tagName = target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select";
}

export function MapEventManager() {
    const map = useMap();
    const mode = useInteractionModeStore((state) => state.mode);
    const addPathMode = usePathStore((state) => state.addMode);
    const selectedId = useWaypointStore((state) => state.selectedId);
    const isDeletable = useWaypointStore((state) => state.isDeletable);
    const waypoints = useWaypointStore((state) => state.waypoints);
    const cancelSegmentConnection = usePathStore((state) => state.cancelSegmentConnection);
    const deselectWaypoint = useWaypointStore((state) => state.deselectWaypoint);
    const selectWaypoint = useWaypointStore((state) => state.selectWaypoint);
    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);
    const navigate = useNavigate();
    const location = useLocation();
    const lastSyncedId = useRef<number | null>(null);
    const addMode = mode === "waypoint-add";

    const onMapClick = useCallback(
        (e: L.LeafletMouseEvent) => {
            if ((e.originalEvent.target as HTMLElement)?.closest("#menu")) return; // Ignore clicks on the menu
            if (addMode && selectedId === null) {
                waypointActions.addWaypoint(e.latlng.lat, e.latlng.lng);
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
            const hasModifier = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();
            if (hasModifier && !isTextInputTarget(e.target)) {
                if (key === "z" && !e.shiftKey) {
                    e.preventDefault();
                    undo();
                    return;
                }

                if (key === "y" || (key === "z" && e.shiftKey)) {
                    e.preventDefault();
                    redo();
                    return;
                }
            }

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

                    waypointActions.updateWaypoint(wp.id, { lat, lng });
                    break; // Exit the loop after updating the selected waypoint
                }
            }

            // Delete selected waypoint on "Delete" key press
            if (e.key === "Delete" && selectedId !== null) {
                if (!isDeletable(selectedId)) return;
                const confirmed = window.confirm("Are you sure you want to delete this waypoint?");
                if (!confirmed) return;
                waypointActions.deleteWaypointWithDependencies(selectedId);
                deselectWaypoint();
            }
        },
        [isDeletable, selectedId, waypoints, deselectWaypoint, redo, undo]
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
        // if the URL has the route /waypoints/:id, extract the id and select the waypoint
        if (!location.pathname.startsWith("/waypoints/")) {
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
    }, [deselectWaypoint, location.pathname, map, selectWaypoint, waypoints]);

    useEffect(() => {
        if (selectedId !== lastSyncedId.current) {
            if (selectedId === null) {
                // Only navigate to "/" if we're currently viewing a waypoint detail
                if (location.pathname.startsWith("/waypoints/")) {
                    navigate("/");
                }
            } else {
                navigate(`/waypoints/${selectedId}`);
            }
            lastSyncedId.current = selectedId;
        }
    }, [selectedId, location.pathname, navigate]);

    return null;
}
