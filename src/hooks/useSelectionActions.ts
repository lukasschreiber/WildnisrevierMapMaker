import { useCallback } from "react";
import { SelectableEntity, useInteractionsStore } from "../stores/useInteractions";
import { useUrlState } from "./useUrlState";

type SelectionActionOptions = {
    focus?: () => void;
};

export function useSelectionActions() {
    const { setSelection, clearSelection: clearUrlSelection } = useUrlState();

    const selectOnly = useInteractionsStore((state) => state.selectOnly);
    const replaceSelection = useInteractionsStore((state) => state.replaceSelection);
    const clearStoreSelection = useInteractionsStore((state) => state.clearSelection);

    const selectEntity = useCallback(
        (entity: SelectableEntity, id: number, options?: SelectionActionOptions) => {
            selectOnly(entity, id);

            setSelection(
                { [entity]: [id] },
                {
                    active: { type: entity, id },
                    openPanel: true,
                },
            );

            options?.focus?.();
        },
        [selectOnly, setSelection],
    );

    const selectEntities = useCallback(
        (entity: SelectableEntity, ids: number[], options?: SelectionActionOptions) => {
            replaceSelection({ [entity]: ids });

            setSelection(
                { [entity]: ids },
                {
                    active: null,
                    openPanel: true,
                },
            );

            options?.focus?.();
        },
        [replaceSelection, setSelection],
    );

    const clearSelection = useCallback(() => {
        clearStoreSelection();
        clearUrlSelection({ clearActive: true });
    }, [clearStoreSelection, clearUrlSelection]);

    return {
        selectEntity,
        selectEntities,
        clearSelection,
    };
}
