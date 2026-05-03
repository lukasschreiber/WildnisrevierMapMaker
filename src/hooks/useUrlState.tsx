import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

export type UrlEntityType = "waypoint" | "waypoint-type" | "path" | "shape" | "group";
export type UrlSelectableEntityType = "waypoint" | "path" | "shape";

export type UrlEntityRef = {
    type: UrlEntityType;
    id: number;
};

export type UrlSelection = Partial<Record<UrlSelectableEntityType, number[]>>;

const PANEL_PATH_BY_ENTITY_TYPE: Record<UrlEntityType, string> = {
    waypoint: "/waypoints",
    "waypoint-type": "/types",
    path: "/paths",
    shape: "/shapes",
    group: "/groups",
};

const SELECTABLE_TYPES = ["waypoint", "path", "shape"] as const;
const ENTITY_TYPES = ["waypoint", "waypoint-type", "path", "shape", "group"] as const;

type NavigateOptions = {
    replace?: boolean;
};

type SelectionOptions = NavigateOptions & {
    active?: UrlEntityRef | null;
    openPanel?: boolean;
};

function isSelectableEntityType(type: string): type is UrlSelectableEntityType {
    return SELECTABLE_TYPES.includes(type as UrlSelectableEntityType);
}

function isUrlEntityType(type: string): type is UrlEntityType {
    return ENTITY_TYPES.includes(type as UrlEntityType);
}

function getSelectionType(selection: UrlSelection): UrlSelectableEntityType | null {
    return SELECTABLE_TYPES.find((type) => selection[type]?.length) ?? null;
}

export function getEntityPanelPath(type: UrlEntityType): string {
    return PANEL_PATH_BY_ENTITY_TYPE[type];
}

export function parseSelection(value: string | null): UrlSelection {
    if (!value) return {};

    const [type, idsRaw] = value.split(":");
    if (!type || !idsRaw || !isSelectableEntityType(type)) return {};

    const ids = idsRaw.split(",").map(Number).filter(Number.isFinite);

    return ids.length ? { [type]: ids } : {};
}

export function serializeSelection(selection: UrlSelection): string | null {
    const type = getSelectionType(selection);
    return type ? `${type}:${selection[type]!.join(",")}` : null;
}

export function parseEntityRef(value: string | null): UrlEntityRef | null {
    if (!value) return null;

    const [type, idRaw] = value.split(":");
    const id = Number(idRaw);

    if (!type || !isUrlEntityType(type) || !Number.isFinite(id)) return null;

    return { type, id };
}

export function serializeEntityRef(ref: UrlEntityRef | null): string | null {
    return ref ? `${ref.type}:${ref.id}` : null;
}

export function useUrlState() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const selection = useMemo(() => parseSelection(params.get("select")), [params]);

    const active = useMemo(() => parseEntityRef(params.get("active")), [params]);

    const setActive = useCallback(
        (nextActive: UrlEntityRef | null, options?: NavigateOptions) => {
            const nextParams = new URLSearchParams(location.search);
            const serializedActive = serializeEntityRef(nextActive);

            if (serializedActive) {
                nextParams.set("active", serializedActive);
            } else {
                nextParams.delete("active");
            }

            const pathname = nextActive ? getEntityPanelPath(nextActive.type) : location.pathname;

            navigate(
                {
                    pathname,
                    search: nextParams.toString(),
                },
                { replace: options?.replace ?? false },
            );
        },
        [navigate, location.pathname, location.search],
    );

    const setSelection = useCallback(
        (nextSelection: UrlSelection, options?: SelectionOptions) => {
            const nextParams = new URLSearchParams(location.search);
            const serializedSelection = serializeSelection(nextSelection);

            if (serializedSelection) {
                nextParams.set("select", serializedSelection);
            } else {
                nextParams.delete("select");
            }

            if (options && "active" in options) {
                const serializedActive = serializeEntityRef(options.active ?? null);

                if (serializedActive) {
                    nextParams.set("active", serializedActive);
                } else {
                    nextParams.delete("active");
                }
            }

            const selectedType = getSelectionType(nextSelection);

            const pathname =
                options?.openPanel !== false && selectedType ? getEntityPanelPath(selectedType) : location.pathname;

            navigate(
                {
                    pathname,
                    search: nextParams.toString(),
                },
                { replace: options?.replace ?? false },
            );
        },
        [navigate, location.pathname, location.search],
    );

    const clearSelection = useCallback(
        (options?: NavigateOptions & { clearActive?: boolean }) => {
            setSelection(
                {},
                {
                    active: options?.clearActive ? null : undefined,
                    replace: options?.replace,
                    openPanel: false,
                },
            );
        },
        [setSelection],
    );

    return {
        selection,
        active,
        setSelection,
        setActive,
        clearSelection,
    };
}
