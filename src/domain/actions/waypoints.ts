import { executeHistoryAction } from "../history/executeHistoryAction";
import { usePathStore } from "../../stores/usePaths";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import { useInteractionsStore } from "../../stores/useInteractions";

export const waypointActions = {
    addWaypoint: (lat: number, lng: number, baseId?: number, name?: string, typeId?: number, groupId?: number): number => {
        return executeHistoryAction("Add waypoint", ["waypoints"], () => {
            return useWaypointStore.getState().addWaypoint(lat, lng, baseId, name, typeId, groupId);
        });
    },

    updateWaypoint: (id: number, waypoint: Partial<Waypoint>) => {
        executeHistoryAction("Update waypoint", ["waypoints"], () => {
            useWaypointStore.getState().updateWaypoint(id, waypoint);
        });
    },

    updateWaypoints: (updates: { id: number; data: Partial<Waypoint> }[]) => {
        executeHistoryAction("Update waypoints", ["waypoints"], () => {
            useWaypointStore.getState().bulkUpdateWaypoints(updates);
        });
    },

    deleteWaypointWithDependencies: (id: number) => {
        executeHistoryAction("Delete waypoint", ["waypoints", "paths", "shapes"], () => {
            const pathStore = usePathStore.getState();

            for (const path of pathStore.paths) {
                for (const segment of path.segments) {
                    if (segment.from.waypointId === id || segment.to.waypointId === id) {
                        pathStore.deleteSegment(segment.id);
                    }
                }
            }

            useWaypointStore.getState().deleteWaypoint(id);
            useInteractionsStore.getState().deselect("waypoint", id);
        });
    },
};
