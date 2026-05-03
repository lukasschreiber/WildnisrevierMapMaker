import { useCallback, useEffect, useRef } from "react";
import { useWaypointStore } from "../stores/useWaypoints";
import { useInteractionsStore } from "../stores/useInteractions";
import { waypointActions } from "../domain/actions/waypoints";
import { useHistoryStore } from "../stores/useHistory";
import { useMap } from "../context/useMap";
import { useUrlState } from "../hooks/useUrlState";
import { useSelectionActions } from "../hooks/useSelectionActions";

function isTextInputTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;

    const tagName = target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select";
}

function areNumberArraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
}

export function MapEventManager() {
    const map = useMap();

    const { selection, setSelection } = useUrlState();

    const mode = useInteractionsStore((state) => state.mode);
    const selectedWaypointIds = useInteractionsStore((state) => state.selectedWaypointIds);
    const selectedPathIds = useInteractionsStore((state) => state.selectedPathIds);
    const selectedShapeIds = useInteractionsStore((state) => state.selectedShapeIds);

    const selectOnly = useInteractionsStore((state) => state.selectOnly);
    const deselect = useInteractionsStore((state) => state.deselect);
    const { clearSelection } = useSelectionActions();
    const replaceSelection = useInteractionsStore((state) => state.replaceSelection);

    const cancelPathConnection = useInteractionsStore((state) => state.cancelPathConnection);
    const cancelRelativeWaypointCreation = useInteractionsStore((state) => state.cancelRelativeWaypointCreation);

    const isDeletable = useWaypointStore((state) => state.isDeletable);
    const waypoints = useWaypointStore((state) => state.waypoints);

    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);

    const isApplyingUrlToStore = useRef(false);
    const lastFocusedWaypointId = useRef<number | null>(null);

    const onMapClick = useCallback(
        (e: L.LeafletMouseEvent) => {
            if (mode === "waypoint-add") {
                const newId = waypointActions.addWaypoint(e.latlng.lat, e.latlng.lng);

                selectOnly("waypoint", newId);

                setSelection(
                    { waypoint: [newId] },
                    {
                        active: {
                            type: "waypoint",
                            id: newId,
                        },
                    },
                );

                return;
            }

            cancelPathConnection();
            cancelRelativeWaypointCreation();
            clearSelection();

            lastFocusedWaypointId.current = null;

            setSelection(
                {},
                {
                    active: null,
                },
            );
        },
        [mode, selectOnly, setSelection, cancelPathConnection, cancelRelativeWaypointCreation, clearSelection],
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

    /**
     * URL -> interaction store
     */
    useEffect(() => {
        const urlWaypointIds = selection.waypoint ?? [];
        const urlPathIds = selection.path ?? [];
        const urlShapeIds = selection.shape ?? [];

        const nextSelection =
            urlWaypointIds.length > 0
                ? { waypoint: urlWaypointIds }
                : urlPathIds.length > 0
                  ? { path: urlPathIds }
                  : urlShapeIds.length > 0
                    ? { shape: urlShapeIds }
                    : {};

        const nextWaypointIds = nextSelection.waypoint ?? [];
        const nextPathIds = nextSelection.path ?? [];
        const nextShapeIds = nextSelection.shape ?? [];

        const waypointChanged = !areNumberArraysEqual(nextWaypointIds, selectedWaypointIds);
        const pathChanged = !areNumberArraysEqual(nextPathIds, selectedPathIds);
        const shapeChanged = !areNumberArraysEqual(nextShapeIds, selectedShapeIds);

        if (!waypointChanged && !pathChanged && !shapeChanged) return;

        isApplyingUrlToStore.current = true;
        replaceSelection(nextSelection);

        queueMicrotask(() => {
            isApplyingUrlToStore.current = false;
        });
    }, [selection, selectedWaypointIds, selectedPathIds, selectedShapeIds, replaceSelection]);

    /**
     * URL -> interaction store
     * Used for reload, deep links, back/forward.
     */
    useEffect(() => {
        const urlWaypointIds = selection.waypoint ?? [];
        const urlPathIds = selection.path ?? [];
        const urlShapeIds = selection.shape ?? [];

        const nextSelection =
            urlWaypointIds.length > 0
                ? { waypoint: urlWaypointIds }
                : urlPathIds.length > 0
                  ? { path: urlPathIds }
                  : urlShapeIds.length > 0
                    ? { shape: urlShapeIds }
                    : {};

        replaceSelection(nextSelection);
    }, [selection, replaceSelection]);

    return null;
}
