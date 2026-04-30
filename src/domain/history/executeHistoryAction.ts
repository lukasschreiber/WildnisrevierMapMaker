import {
    HistoryMutation,
    HistoryTarget,
    HistoryValueByTarget,
    HistoryStep,
    useHistoryStore,
} from "../../stores/useHistory";
import { useWaypointStore } from "../../stores/useWaypoints";
import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore } from "../../stores/useGroups";

function cloneValue<T>(value: T): T {
    return structuredClone(value);
}

function getTargetState<T extends HistoryTarget>(target: T): HistoryValueByTarget[T] {
    switch (target) {
        case "waypoints":
            return cloneValue(useWaypointStore.getState().waypoints) as HistoryValueByTarget[T];
        case "paths":
            return cloneValue(usePathStore.getState().paths) as HistoryValueByTarget[T];
        case "shapes":
            return cloneValue(useShapeStore.getState().shapes) as HistoryValueByTarget[T];
        case "waypointTypes":
            return cloneValue(useWaypointTypeStore.getState().types) as HistoryValueByTarget[T];
        case "waypointGroups":
            return cloneValue(useWaypointGroupStore.getState().waypointGroups) as HistoryValueByTarget[T];
        default:
            throw new Error("Unknown history target");
    }
}

function isEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

function createHistoryStep(label: string, mutations: HistoryMutation[]): HistoryStep {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        label,
        timestamp: Date.now(),
        mutations,
    };
}

export function executeHistoryAction<T>(
    label: string,
    targets: HistoryTarget[],
    action: () => T,
): T {
    const historyState = useHistoryStore.getState();
    if (historyState.isReplaying) {
        return action();
    }

    const before = new Map<HistoryTarget, unknown>();
    for (const target of targets) {
        before.set(target, getTargetState(target));
    }

    const result = action();

    const mutations: HistoryMutation[] = [];
    for (const target of targets) {
        const prev = before.get(target);
        const next = getTargetState(target);

        if (isEqual(prev, next)) {
            continue;
        }

        mutations.push({
            target,
            before: prev as never,
            after: next as never,
        });
    }

    if (mutations.length === 0) {
        return result;
    }

    useHistoryStore.getState().pushStep(createHistoryStep(label, mutations));
    return result;
}
