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
        setWaypointAddMode(mode === "waypoint-add");

        const pathModeActive = mode === "path-edit";
        setPathAddMode(pathModeActive);
        setPathReferenceId(pathModeActive ? activePathId : null);

        const shapeModeActive = mode === "shape-edit";
        setShapeAddMode(shapeModeActive);
        setShapeReferenceId(shapeModeActive ? activeShapeId : null);

        if (!pathModeActive) {
            cancelSegmentConnection();
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
