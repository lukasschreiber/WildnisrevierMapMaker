import { executeHistoryAction } from "../history/executeHistoryAction";
import { Path, PathNode, usePathStore } from "../../stores/usePaths";

export const pathActions = {
    addPath: (name: string, color: string): number => {
        return executeHistoryAction("Add path", ["paths"], () => {
            return usePathStore.getState().addPath(name, color);
        });
    },

    createPathWithSegment: (name: string, color: string, from: PathNode, to: PathNode): number => {
        return executeHistoryAction("Create path", ["paths"], () => {
            const pathStore = usePathStore.getState();
            const pathId = pathStore.addPath(name, color);

            usePathStore.getState().addSegment(pathId, from, to);

            return pathId;
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
