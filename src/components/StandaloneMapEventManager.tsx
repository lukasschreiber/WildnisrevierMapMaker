import { useCallback, useEffect } from "react";
import { evaluationEventEmitter } from "../utils/evaluation";
import { useMapContext } from "../context/useMap";
import { useInteractionsStore } from "../stores/useInteractions";

export function StandaloneMapEventManager() {
    const { setSelectedWaypoint, map } = useMapContext();
    const selectedWaypointIds = useInteractionsStore((state) => state.selectedWaypointIds);
    const deselect = useInteractionsStore((state) => state.deselect);

    const onMapClick = useCallback(
        () => {            
            evaluationEventEmitter.emit({
                name: "labelSelect",
                timestamp: new Date(),
                url: window.location.href,
                details: {
                    waypointId: selectedWaypointIds[0] ?? undefined,
                    action: "labelDeselect",
                },
            })

            setSelectedWaypoint(null); // Deselect any selected waypoint
            deselect("waypoint", selectedWaypointIds[0] ?? -1); // Clear selection in interactions store
        },
        [deselect, selectedWaypointIds, setSelectedWaypoint]
    );

    useEffect(() => {
        map.on("click", onMapClick);
        return () => {
            map.off("click", onMapClick);
        };
    }, [map, onMapClick]);

    return null;
}
