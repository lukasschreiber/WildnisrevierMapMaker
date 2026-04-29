import { executeHistoryAction } from "../history/executeHistoryAction";
import { usePathStore } from "../../stores/usePaths";
import { useWaypointStore } from "../../stores/useWaypoints";

export const waypointActions = {
    addWaypoint: (lat: number, lng: number, baseId?: number, name?: string, typeId?: number, groupId?: number) => {
        executeHistoryAction("Add waypoint", ["waypoints"], () => {
            useWaypointStore.getState().addWaypoint(lat, lng, baseId, name, typeId, groupId);
        });
    },

    updateWaypointPosition: (id: number, lat: number, lng: number) => {
        executeHistoryAction("Move waypoint", ["waypoints"], () => {
            useWaypointStore.getState().updateWaypointPosition(id, lat, lng);
        });
    },

    updateWaypointName: (id: number, name: string) => {
        executeHistoryAction("Rename waypoint", ["waypoints"], () => {
            useWaypointStore.getState().updateWaypointName(id, name);
        });
    },

    updateWaypointAdditionalText: (id: number, text: string) => {
        executeHistoryAction("Update waypoint text", ["waypoints"], () => {
            useWaypointStore.getState().updateWaypointAdditionalText(id, text);
        });
    },

    updateWaypointType: (id: number, typeId: number) => {
        executeHistoryAction("Change waypoint type", ["waypoints"], () => {
            useWaypointStore.getState().updateWaypointType(id, typeId);
        });
    },

    updateWaypointGroup: (id: number, groupId?: number) => {
        executeHistoryAction("Change waypoint group", ["waypoints"], () => {
            useWaypointStore.getState().updateWaypointGroup(id, groupId);
        });
    },

    toggleWaypointHidden: (id: number) => {
        executeHistoryAction("Toggle waypoint visibility", ["waypoints"], () => {
            useWaypointStore.getState().toggleWaypointHidden(id);
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
        });
    },
};
