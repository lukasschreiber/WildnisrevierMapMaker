import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { usePathStore } from "../../stores/usePaths";
import React, { useMemo } from "react";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { TextInput } from "../inputs/TextInput";
import { NumberInput } from "../inputs/NumberInput";
import { ColorInput } from "../inputs/ColorInput";
import { Checkbox } from "../inputs/Checkbox";
import { Select } from "../inputs/Select";
import { pathActions } from "../../domain/actions/paths";
import { useInteractionModeStore } from "../../stores/useInteractionMode";

export function PathsPanel() {
    const paths = usePathStore((state) => state.paths);

    const sensors = useSensors(useSensor(PointerSensor));

    const sortedPaths = useMemo(() => {
        return [...paths].sort((a, b) => {
            const orderA = a.order ?? 0;
            const orderB = b.order ?? 0;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return a.id.toString().localeCompare(b.id.toString());
        });
    }, [paths]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sortedPaths.findIndex((s) => s.id === active.id);
        const newIndex = sortedPaths.findIndex((s) => s.id === over.id);

        if (oldIndex !== newIndex) {
            const reordered = arrayMove(sortedPaths, oldIndex, newIndex);
            reordered.forEach((path, index) => {
                pathActions.updatePath(path.id, { order: index });
            });
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="font-bold text-sm mb-2">Paths - {paths.length}</div>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext items={sortedPaths.map((path) => path.id)} strategy={verticalListSortingStrategy}>
                    {sortedPaths.map((path) => (
                        <SortablePathRow key={path.id} pathId={path.id} />
                    ))}
                </SortableContext>
            </DndContext>
            <button
                onClick={() => pathActions.addPath("New Path", "#000000")}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Path
            </button>
        </div>
    );
}

const SortablePathRow = React.memo(({ pathId }: { pathId: number }) => {
    const path = usePathStore((state) => state.paths.find((p) => p.id === pathId))!;
    const mode = useInteractionModeStore((state) => state.mode);
    const activePathId = useInteractionModeStore((state) => state.activePathId);
    const togglePathEdit = useInteractionModeStore((state) => state.togglePathEdit);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: path.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col gap-1 border p-1">
            <div className="flex flex-row gap-2 items-center">
                <div {...attributes} {...listeners} className="cursor-grab p-1 select-none">
                    ⋮⋮
                </div>
                <TextInput value={path.name} onChange={(value) => pathActions.updatePath(path.id, { name: value })} />
                <Select
                    value={path.style}
                    onChange={(value) => pathActions.updatePath(path.id, { style: value })}
                    options={[
                        { label: "Solid", value: "solid" },
                        { label: "Dashed", value: "dashed" },
                        { label: "Dotted", value: "dotted" },
                    ]}
                    placeholder="Style"
                />
                <NumberInput
                    value={path.tension}
                    onChange={(value) => pathActions.updatePath(path.id, { tension: value })}
                    placeholder="Tension"
                    min={0}
                    max={1}
                    step={0.01}
                    className="max-w-14"
                />
                <NumberInput
                    value={path.width}
                    onChange={(value) => pathActions.updatePath(path.id, { width: value })}
                    placeholder="Width"
                    min={0}
                    className="max-w-14"
                />
                <ColorInput
                    value={path.color}
                    onChange={(value) => pathActions.updatePath(path.id, { color: value })}
                    placeholder="Color"
                    className="max-w-14"
                />
                <NumberInput
                    value={path.outlineWidth}
                    onChange={(value) => pathActions.updatePath(path.id, { outlineWidth: value })}
                    placeholder="Outline Width"
                    min={0}
                    className="max-w-14"
                />
                <ColorInput
                    value={path.outlineColor}
                    onChange={(value) => pathActions.updatePath(path.id, { outlineColor: value })}
                    placeholder="Outline Color"
                    className="max-w-14"
                />
                <Select
                    value={path.linecap}
                    onChange={(value) => pathActions.updatePath(path.id, { linecap: value })}
                    options={[
                        { label: "Round", value: "round" },
                        { label: "Butt", value: "butt" },
                        { label: "Square", value: "square" },
                    ]}
                    placeholder="Linecap"
                />
                <NumberInput
                    value={path.opacity}
                    onChange={(value) => pathActions.updatePath(path.id, { opacity: value })}
                    placeholder="Opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    className="max-w-14"
                />
                <Checkbox
                    onChange={(value) => pathActions.updatePath(path.id, { hidden: value })}
                    label="Hidden"
                    value={path.hidden}
                />
                <TextInput
                    value={path.dasharray}
                    onChange={(value) => pathActions.updatePath(path.id, { dasharray: value })}
                    placeholder="Dasharray"
                />
                <div>{path.segments?.length?.toFixed(0).padStart(2, "0")} seg</div>
                <button
                    onClick={() => {
                        togglePathEdit(path.id);
                    }}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded"
                >
                    {mode === "path-edit" && activePathId === path.id ? "Cancel" : "Edit Points"}
                </button>
                <button onClick={() => pathActions.deletePath(path.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded">
                    Delete
                </button>
            </div>
        </div>
    );
});
