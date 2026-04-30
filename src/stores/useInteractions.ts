import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";
import { usePathStore } from "./usePaths";
import { pathActions } from "../domain/actions/paths";
import { canAppendToPath, findExtendablePathFromWaypoint } from "../renderer/paths/pathUtils";

export type InteractionMode = "select" | "waypoint-add" | "path-edit" | "shape-edit";

export type SelectableEntity = "waypoint" | "path" | "shape";

type NewWaypointConfig = {
    name: string;
    typeId: number;
    groupId?: number;
};

type PathEdit = {
    connectionStartedWaypointId: number | null;
    selectedSegmentId: number | null;
};

type SelectionKey = "selectedWaypointIds" | "selectedPathIds" | "selectedShapeIds";

const selectionKeyByEntity: Record<SelectableEntity, SelectionKey> = {
    waypoint: "selectedWaypointIds",
    path: "selectedPathIds",
    shape: "selectedShapeIds",
};

interface InteractionModeState {
    mode: InteractionMode;
    setMode: (mode: InteractionMode) => void;

    newWaypointConfig: NewWaypointConfig;
    updateNewWaypointConfig: (config: Partial<NewWaypointConfig>) => void;
    resetNewWaypointConfig: () => void;

    selectedWaypointIds: number[];
    selectedPathIds: number[];
    selectedShapeIds: number[];

    isSelected: (entity: SelectableEntity, id: number) => boolean;
    select: (entity: SelectableEntity, id: number) => void;
    selectOnly: (entity: "waypoint" | "path" | "shape", id: number) => void;
    deselect: (entity: SelectableEntity, id: number) => void;
    clearSelection: (entity?: SelectableEntity) => void;

    getSelectedIds: (entity: SelectableEntity) => number[];

    pathEdit: PathEdit;
    startPathConnection: (waypointId: number) => void;
    endPathConnection: (waypointId: number) => void;
    cancelPathConnection: () => void;
    selectSegment: (id: number) => void;
    deselectSegment: () => void;
}

const defaultNewWaypointConfig: NewWaypointConfig = {
    name: "",
    typeId: 1,
    groupId: undefined,
};

export const useInteractionsStore = create<InteractionModeState>()(
    persist(
        (set, get) => ({
            mode: "select",

            setMode: (mode) => {
                set({ mode });
            },

            newWaypointConfig: defaultNewWaypointConfig,

            updateNewWaypointConfig: (config) => {
                set((state) => ({
                    newWaypointConfig: {
                        ...state.newWaypointConfig,
                        ...config,
                    },
                }));
            },

            resetNewWaypointConfig: () => {
                set({ newWaypointConfig: defaultNewWaypointConfig });
            },

            selectedWaypointIds: [],
            selectedPathIds: [],
            selectedShapeIds: [],

            getSelectedIds: (entity) => {
                return get()[selectionKeyByEntity[entity]];
            },

            isSelected: (entity, id) => {
                return get().getSelectedIds(entity).includes(id);
            },

            select: (entity, id) => {
                const key = selectionKeyByEntity[entity];

                set((state) => {
                    if (state[key].includes(id)) return state;

                    return {
                        selectedWaypointIds: entity === "waypoint" ? [...state.selectedWaypointIds, id] : [],
                        selectedPathIds: entity === "path" ? [...state.selectedPathIds, id] : [],
                        selectedShapeIds: entity === "shape" ? [...state.selectedShapeIds, id] : [],
                    };
                });
            },

            deselect: (entity, id) => {
                const key = selectionKeyByEntity[entity];

                set((state) => {
                    if (!state[key].includes(id)) return state;

                    return {
                        [key]: state[key].filter((selectedId) => selectedId !== id),
                    } as Pick<InteractionModeState, SelectionKey>;
                });
            },

            clearSelection: (entity) => {
                if (entity) {
                    const key = selectionKeyByEntity[entity];
                    set({ [key]: [] } as unknown as Pick<InteractionModeState, SelectionKey>);
                    return;
                }

                set({
                    selectedWaypointIds: [],
                    selectedPathIds: [],
                    selectedShapeIds: [],
                });
            },

            selectOnly: (entity, id) => {
                set({
                    selectedWaypointIds: entity === "waypoint" ? [id] : [],
                    selectedPathIds: entity === "path" ? [id] : [],
                    selectedShapeIds: entity === "shape" ? [id] : [],
                });
            },
            
            pathEdit: {
                selectedSegmentId: null,
                connectionStartedWaypointId: null,
            },

            startPathConnection: (waypointId) => {
                set({
                    pathEdit: {
                        ...get().pathEdit,
                        connectionStartedWaypointId: waypointId,
                    },
                });
            },

            endPathConnection: (waypointId) => {
                const { connectionStartedWaypointId } = get().pathEdit;

                if (connectionStartedWaypointId === null || connectionStartedWaypointId === waypointId) {
                    set((state) => ({
                        pathEdit: {
                            ...state.pathEdit,
                            connectionStartedWaypointId: null,
                        },
                    }));
                    return;
                }

                const from = { waypointId: connectionStartedWaypointId };
                const to = { waypointId };

                const pathStore = usePathStore.getState();

                const extendablePath = findExtendablePathFromWaypoint(pathStore.paths, connectionStartedWaypointId);

                if (extendablePath && canAppendToPath(extendablePath, connectionStartedWaypointId, waypointId)) {
                    pathActions.addSegment(extendablePath.id, from, to);
                } else {
                    pathActions.createPathWithSegment("New path", "#000000", from, to);
                }

                set((state) => ({
                    pathEdit: {
                        ...state.pathEdit,
                        connectionStartedWaypointId: null,
                    },
                }));
            },

            cancelPathConnection: () => {
                set((state) => ({
                    pathEdit: {
                        ...state.pathEdit,
                        connectionStartedWaypointId: null,
                    },
                }));
            },

            selectSegment: (id) => {
                set((state) => ({
                    mode: "path-edit",
                    pathEdit: {
                        ...state.pathEdit,
                        selectedSegmentId: id,
                    },
                }));
            },

            deselectSegment: () => {
                set((state) => ({
                    pathEdit: {
                        ...state.pathEdit,
                        selectedSegmentId: null,
                    },
                }));
            },
        }),
        {
            name: getLocalStorageKey("interaction_mode"),

            partialize: (state) => ({
                mode: state.mode,
                newWaypointConfig: state.newWaypointConfig,
                selectedWaypointIds: state.selectedWaypointIds,
                selectedPathIds: state.selectedPathIds,
                selectedShapeIds: state.selectedShapeIds,
                pathEdit: state.pathEdit,
            }),
        },
    ),
);
