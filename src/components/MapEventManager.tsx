import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWaypointStore } from "../stores/useWaypoints";
import { useLocation, useNavigate } from "react-router";
import { useInteractionsStore } from "../stores/useInteractions";
import { waypointActions } from "../domain/actions/waypoints";
import { useHistoryStore } from "../stores/useHistory";
import { useMap } from "../context/useMap";

function isTextInputTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;

    const tagName = target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select";
}

type SyncedSelection = {
    type: "waypoint" | "path" | null;
    id: number | null;
};

function isSameSyncedSelection(selection: SyncedSelection, type: SyncedSelection["type"], id: number | null) {
    return selection.type === type && selection.id === id;
}

function isSelectionSyncRoute(pathname: string) {
    return pathname === "/" || pathname.startsWith("/waypoints/") || pathname.startsWith("/paths/");
}

export function MapEventManager() {
    const map = useMap();

    const mode = useInteractionsStore((state) => state.mode);
    const selectedWaypointIds = useInteractionsStore((state) => state.selectedWaypointIds);
    const selectedPathIds = useInteractionsStore((state) => state.selectedPathIds);

    const selectOnly = useInteractionsStore((state) => state.selectOnly);
    const deselect = useInteractionsStore((state) => state.deselect);
    const clearSelection = useInteractionsStore((state) => state.clearSelection);
    const cancelPathConnection = useInteractionsStore((state) => state.cancelPathConnection);

    const selectedWaypointId = useMemo(
        () => (selectedWaypointIds.length > 0 ? selectedWaypointIds[selectedWaypointIds.length - 1] : null),
        [selectedWaypointIds],
    );

    const selectedPathId = useMemo(
        () => (selectedPathIds.length > 0 ? selectedPathIds[selectedPathIds.length - 1] : null),
        [selectedPathIds],
    );

    const syncedSelection = useMemo<SyncedSelection>(() => {
        if (selectedWaypointId !== null) {
            return {
                type: "waypoint",
                id: selectedWaypointId,
            };
        }

        if (selectedPathId !== null) {
            return {
                type: "path",
                id: selectedPathId,
            };
        }

        return {
            type: null,
            id: null,
        };
    }, [selectedWaypointId, selectedPathId]);

    const isDeletable = useWaypointStore((state) => state.isDeletable);
    const waypoints = useWaypointStore((state) => state.waypoints);

    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);

    const navigate = useNavigate();
    const location = useLocation();

    const lastSyncedSelection = useRef<SyncedSelection>({
        type: null,
        id: null,
    });

    const onMapClick = useCallback(
        (e: L.LeafletMouseEvent) => {
            if (mode === "waypoint-add") {
                const newId = waypointActions.addWaypoint(e.latlng.lat, e.latlng.lng);
                selectOnly("waypoint", newId);
                return;
            }

            cancelPathConnection();
            clearSelection();
        },
        [mode, cancelPathConnection, clearSelection, selectOnly],
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

            if (selectedWaypointIds.length === 0) return;

            const step = hasModifier ? 0.000001 : e.shiftKey ? 0.0001 : 0.00001;

            if (
                !isTextInputTarget(e.target) &&
                (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight")
            ) {
                e.preventDefault();
                e.stopPropagation();

                const selectedWaypoints = waypoints.filter((wp) => selectedWaypointIds.includes(wp.id));

                const updatedWaypoints = selectedWaypoints.map((waypoint) => {
                    let { lat, lng } = waypoint;

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
                    }

                    return {
                        id: waypoint.id,
                        data: { lat, lng },
                    };
                });

                waypointActions.updateWaypoints(updatedWaypoints);
            }

            if (e.key === "Delete") {
                for (const id of selectedWaypointIds) {
                    if (!isDeletable(id)) continue;

                    waypointActions.deleteWaypointWithDependencies(id);
                    deselect("waypoint", id);
                }
            }
        },
        [selectedWaypointIds, undo, redo, waypoints, isDeletable, deselect],
    );

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown, true);

        return () => {
            window.removeEventListener("keydown", onKeyDown, true);
        };
    }, [onKeyDown]);

    useEffect(() => {
        map.on("click", onMapClick);

        return () => {
            map.off("click", onMapClick);
        };
    }, [map, onMapClick]);

    useEffect(() => {
        if (location.pathname.startsWith("/waypoints/")) {
            const param = location.pathname.split("/").pop();
            const id = param ? parseInt(param, 10) : null;

            if (id !== null && !Number.isNaN(id)) {
                if (isSameSyncedSelection(lastSyncedSelection.current, "waypoint", id)) return;

                clearSelection();
                selectOnly("waypoint", id);

                const waypoint = waypoints.find((wp) => wp.id === id);
                if (waypoint) {
                    map.flyTo([waypoint.lat, waypoint.lng], 20);
                }

                lastSyncedSelection.current = {
                    type: "waypoint",
                    id,
                };

                return;
            }
        }

        if (location.pathname.startsWith("/paths/")) {
            const param = location.pathname.split("/").pop();
            const id = param ? parseInt(param, 10) : null;

            if (id !== null && !Number.isNaN(id)) {
                if (isSameSyncedSelection(lastSyncedSelection.current, "path", id)) return;

                clearSelection();
                selectOnly("path", id);

                lastSyncedSelection.current = {
                    type: "path",
                    id,
                };

                return;
            }
        }

        if (!isSameSyncedSelection(lastSyncedSelection.current, null, null)) {
            clearSelection();

            lastSyncedSelection.current = {
                type: null,
                id: null,
            };
        }
    }, [location.pathname, map, waypoints, clearSelection, selectOnly]);

    useEffect(() => {
        if (!isSelectionSyncRoute(location.pathname)) return;

        if (isSameSyncedSelection(lastSyncedSelection.current, syncedSelection.type, syncedSelection.id)) return;

        if (syncedSelection.type === "waypoint" && syncedSelection.id !== null) {
            const pathname = `/waypoints/${syncedSelection.id}`;

            if (location.pathname !== pathname) {
                navigate(pathname);
            }

            lastSyncedSelection.current = syncedSelection;
            return;
        }

        if (syncedSelection.type === "path" && syncedSelection.id !== null) {
            const pathname = `/paths/${syncedSelection.id}`;

            if (location.pathname !== pathname) {
                navigate(pathname);
            }

            lastSyncedSelection.current = syncedSelection;
            return;
        }

        if (location.pathname.startsWith("/waypoints/") || location.pathname.startsWith("/paths/")) {
            navigate("/");
        }

        lastSyncedSelection.current = syncedSelection;
    }, [syncedSelection, location.pathname, navigate]);

    return null;
}
