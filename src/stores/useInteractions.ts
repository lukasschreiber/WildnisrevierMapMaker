import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";
import { usePathStore } from "./usePaths";
import { pathActions } from "../domain/actions/paths";
import { canAppendToPath, findExtendablePathFromWaypoint } from "../renderer/paths/pathUtils";
import { waypointActions } from "../domain/actions/waypoints";

export type InteractionMode = "select" | "waypoint-add" | "path-edit" | "shape-edit";

export type SelectableEntity = "waypoint" | "path" | "shape";

export type EntitySelection = Partial<Record<SelectableEntity, number[]>>;

type NewWaypointConfig = {
    name: string;
    typeId: number;
    groupId?: number;
};

type PathEdit = {
    connectionStartedWaypointId: number | null;
    selectedSegmentId: number | null;
};

type RelativeWaypointDraft = {
    startWaypointId: number | null;
    bearing: number;
    distance: number;
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

    getSelection: () => EntitySelection;
    getSelectedEntity: () => SelectableEntity | null;
    getSelectedIds: (entity: SelectableEntity) => number[];

    isSelected: (entity: SelectableEntity, id: number) => boolean;
    select: (entity: SelectableEntity, id: number) => void;
    selectOnly: (entity: SelectableEntity, id: number) => void;
    deselect: (entity: SelectableEntity, id: number) => void;
    clearSelection: (entity?: SelectableEntity) => void;
    replaceSelection: (selection: EntitySelection) => void;

    relativeWaypoint: RelativeWaypointDraft;
    setRelativeWaypointBearing: (bearing: number) => void;
    setRelativeWaypointDistance: (distance: number) => void;
    startRelativeWaypointCreation: (startWaypointId: number) => void;
    createRelativeWaypoint: () => number;
    cancelRelativeWaypointCreation: () => void;

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

function normalizeSelection(selection: EntitySelection): Required<Record<SelectableEntity, number[]>> {
    if (selection.waypoint?.length) {
        return {
            waypoint: selection.waypoint,
            path: [],
            shape: [],
        };
    }

    if (selection.path?.length) {
        return {
            waypoint: [],
            path: selection.path,
            shape: [],
        };
    }

    if (selection.shape?.length) {
        return {
            waypoint: [],
            path: [],
            shape: selection.shape,
        };
    }

    return {
        waypoint: [],
        path: [],
        shape: [],
    };
}

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

            getSelection: () => {
                const state = get();

                if (state.selectedWaypointIds.length > 0) {
                    return { waypoint: state.selectedWaypointIds };
                }

                if (state.selectedPathIds.length > 0) {
                    return { path: state.selectedPathIds };
                }

                if (state.selectedShapeIds.length > 0) {
                    return { shape: state.selectedShapeIds };
                }

                return {};
            },

            getSelectedEntity: () => {
                const state = get();

                if (state.selectedWaypointIds.length > 0) return "waypoint";
                if (state.selectedPathIds.length > 0) return "path";
                if (state.selectedShapeIds.length > 0) return "shape";

                return null;
            },

            getSelectedIds: (entity) => {
                return get()[selectionKeyByEntity[entity]];
            },

            isSelected: (entity, id) => {
                return get().getSelectedIds(entity).includes(id);
            },

            select: (entity, id) => {
                const key = selectionKeyByEntity[entity];

                set((state) => {
                    const existingIds = state[key];

                    if (existingIds.includes(id)) return state;

                    return {
                        selectedWaypointIds: entity === "waypoint" ? [...existingIds, id] : [],
                        selectedPathIds: entity === "path" ? [...existingIds, id] : [],
                        selectedShapeIds: entity === "shape" ? [...existingIds, id] : [],
                    };
                });
            },

            selectOnly: (entity, id) => {
                set({
                    selectedWaypointIds: entity === "waypoint" ? [id] : [],
                    selectedPathIds: entity === "path" ? [id] : [],
                    selectedShapeIds: entity === "shape" ? [id] : [],
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

                    set({
                        [key]: [],
                    } as unknown as Pick<InteractionModeState, SelectionKey>);

                    return;
                }

                set({
                    selectedWaypointIds: [],
                    selectedPathIds: [],
                    selectedShapeIds: [],
                });
            },

            replaceSelection: (selection) => {
                const normalized = normalizeSelection(selection);

                set({
                    selectedWaypointIds: normalized.waypoint,
                    selectedPathIds: normalized.path,
                    selectedShapeIds: normalized.shape,
                });
            },

            relativeWaypoint: {
                startWaypointId: null,
                bearing: 45,
                distance: 12,
            },

            setRelativeWaypointBearing: (bearing) => {
                set((state) => ({
                    relativeWaypoint: {
                        ...state.relativeWaypoint,
                        bearing,
                    },
                }));
            },

            setRelativeWaypointDistance: (distance) => {
                set((state) => ({
                    relativeWaypoint: {
                        ...state.relativeWaypoint,
                        distance,
                    },
                }));
            },

            startRelativeWaypointCreation: (startWaypointId) => {
                set((state) => ({
                    relativeWaypoint: {
                        ...state.relativeWaypoint,
                        startWaypointId,
                    },
                }));
            },

            createRelativeWaypoint: () => {
                const { startWaypointId, bearing, distance } = get().relativeWaypoint;

                if (startWaypointId === null) {
                    throw new Error("No start waypoint selected for relative waypoint creation");
                }

                const newId = waypointActions.addRelativeWaypoint({
                    startWaypointId,
                    bearing,
                    distance,
                });

                set((state) => ({
                    relativeWaypoint: {
                        ...state.relativeWaypoint,
                        startWaypointId: null,
                    },
                }));

                return newId;
            },

            cancelRelativeWaypointCreation: () => {
                set((state) => ({
                    relativeWaypoint: {
                        ...state.relativeWaypoint,
                        startWaypointId: null,
                    },
                }));
            },

            pathEdit: {
                selectedSegmentId: null,
                connectionStartedWaypointId: null,
            },

            startPathConnection: (waypointId) => {
                set((state) => ({
                    pathEdit: {
                        ...state.pathEdit,
                        connectionStartedWaypointId: waypointId,
                    },
                }));
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
                pathEdit: state.pathEdit,
                relativeWaypoint: state.relativeWaypoint,
            }),
        },
    ),
);
