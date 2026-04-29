import { executeHistoryAction } from "../history/executeHistoryAction";
import { Shape, useShapeStore } from "../../stores/useShapes";

export const shapeActions = {
    addShape: (name: string, color: string, texture?: string, shapeType?: "smooth" | "straight") => {
        executeHistoryAction("Add shape", ["shapes"], () => {
            useShapeStore.getState().addShape(name, color, texture, shapeType);
        });
    },

    updateShape: (id: number, shape: Partial<Shape>) => {
        executeHistoryAction("Update shape", ["shapes"], () => {
            useShapeStore.getState().updateShape(id, shape);
        });
    },

    removeShape: (id: number) => {
        executeHistoryAction("Delete shape", ["shapes"], () => {
            useShapeStore.getState().removeShape(id);
        });
    },

    addNode: (shapeId: number, waypointId: number) => {
        executeHistoryAction("Add shape node", ["shapes"], () => {
            useShapeStore.getState().addNode(shapeId, waypointId);
        });
    },

    removeNode: (shapeId: number, waypointId: number) => {
        executeHistoryAction("Remove shape node", ["shapes"], () => {
            useShapeStore.getState().removeNode(shapeId, waypointId);
        });
    },
};
