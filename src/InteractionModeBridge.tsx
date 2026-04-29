import { useEffect } from "react";
import { useInteractionModeStore } from "./stores/useInteractionMode";
import { usePathStore } from "./stores/usePaths";
import { useShapeStore } from "./stores/useShapes";
import { useWaypointStore } from "./stores/useWaypoints";

export function InteractionModeBridge() {
    const mode = useInteractionModeStore((state) => state.mode);
    const activePathId = useInteractionModeStore((state) => state.activePathId);
    const activeShapeId = useInteractionModeStore((state) => state.activeShapeId);

    const setWaypointAddMode = useWaypointStore((state) => state.setAddMode);

    const setPathAddMode = usePathStore((state) => state.setAddMode);
    const setPathReferenceId = usePathStore((state) => state.setAddModeReferencePathId);
    const cancelSegmentConnection = usePathStore((state) => state.cancelSegmentConnection);

    const setShapeAddMode = useShapeStore((state) => state.setAddMode);
    const setShapeReferenceId = useShapeStore((state) => state.setAddModeReferenceShapeId);

    useEffect(() => {
        // Avoid unnecessary set calls that may trigger cascading updates
        const waypointAddDesired = mode === "waypoint-add";
        const currentWaypointAdd = useWaypointStore.getState().addMode;
        if (currentWaypointAdd !== waypointAddDesired) {
            setWaypointAddMode(waypointAddDesired);
        }

        const pathModeActive = mode === "path-edit";
        const currentPathAdd = usePathStore.getState().addMode;
        if (currentPathAdd !== pathModeActive) {
            setPathAddMode(pathModeActive);
        }

        const desiredPathRef = pathModeActive ? activePathId : null;
        const currentPathRef = usePathStore.getState().addModeReferencePathId;
        if (currentPathRef !== desiredPathRef) {
            setPathReferenceId(desiredPathRef);
        }

        const shapeModeActive = mode === "shape-edit";
        const currentShapeAdd = useShapeStore.getState().addMode;
        if (currentShapeAdd !== shapeModeActive) {
            setShapeAddMode(shapeModeActive);
        }

        const desiredShapeRef = shapeModeActive ? activeShapeId : null;
        const currentShapeRef = useShapeStore.getState().addModeReferenceShapeId;
        if (currentShapeRef !== desiredShapeRef) {
            setShapeReferenceId(desiredShapeRef);
        }

        if (!pathModeActive) {
            // Only cancel connection if it is actually started to avoid extra sets
            const connStarted = usePathStore.getState().segmentConnectionStarted;
            if (connStarted) cancelSegmentConnection();
        }
    }, [
        activePathId,
        activeShapeId,
        cancelSegmentConnection,
        mode,
        setPathAddMode,
        setPathReferenceId,
        setShapeAddMode,
        setShapeReferenceId,
        setWaypointAddMode,
    ]);

    return null;
}
