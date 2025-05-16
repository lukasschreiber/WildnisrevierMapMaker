import { useCallback, useEffect } from "react";
import { useWaypointStore } from "../stores/useWaypoints";
import { useMap, useMapContext } from "../context/MapContext";
import { evaluationEventEmitter } from "../utils/evaluation";

export function StandaloneMapEventManager() {
    const map = useMap();
    const { setSelectedWaypoint } = useMapContext();
    const selectedId = useWaypointStore((state) => state.selectedId);
    const deselectWaypoint = useWaypointStore((state) => state.deselectWaypoint);

    const onMapClick = useCallback(
        (e: L.LeafletMouseEvent) => {
            if ((e.originalEvent.target as HTMLElement)?.closest("#menu")) return; // Ignore clicks on the menu
            
            evaluationEventEmitter.emit({
                name: "labelSelect",
                timestamp: new Date(),
                url: window.location.href,
                details: {
                    waypointId: selectedId ?? undefined,
                    action: "labelDeselect",
                },
            })

            setSelectedWaypoint(null); // Deselect any selected waypoint
            deselectWaypoint();
        },
        [selectedId, deselectWaypoint, setSelectedWaypoint]
    );

    useEffect(() => {
        map.on("click", onMapClick);
        return () => {
            map.off("click", onMapClick);
        };
    }, [map, onMapClick]);

    return null;
}
