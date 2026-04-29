import { executeHistoryAction } from "../history/executeHistoryAction";
import { Path, PathNode, usePathStore } from "../../stores/usePaths";

export const pathActions = {
    addPath: (name: string, color: string) => {
        executeHistoryAction("Add path", ["paths"], () => {
            usePathStore.getState().addPath(name, color);
        });
    },

    updatePath: (id: number, path: Partial<Path>) => {
        executeHistoryAction("Update path", ["paths"], () => {
            usePathStore.getState().updatePath(id, path);
        });
    },

    deletePath: (id: number) => {
        executeHistoryAction("Delete path", ["paths"], () => {
            usePathStore.getState().deletePath(id);
        });
    },

    addSegment: (pathId: number, from: PathNode, to: PathNode) => {
        executeHistoryAction("Add path segment", ["paths"], () => {
            usePathStore.getState().addSegment(pathId, from, to);
        });
    },

    deleteSegment: (id: number) => {
        executeHistoryAction("Delete path segment", ["paths"], () => {
            usePathStore.getState().deleteSegment(id);
        });
    },
};
