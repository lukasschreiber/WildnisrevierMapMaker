import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { usePathStore } from "../../stores/usePaths";
import { Panel } from "../Panel";
import { memo, useMemo } from "react";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../controls/Button";
import { GripDotsVerticalLinear, PlusLinear, TrashLinear } from "@lukasschreiber/icons";
import { useSelectionActions } from "../../hooks/useSelectionActions";

export function PathsPanel() {
    const paths = usePathStore((state) => state.paths);
    const addPath = usePathStore((state) => state.addPath);
    const updatePath = usePathStore((state) => state.updatePath);

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
                updatePath(path.id, { order: index });
            });
        }
    };

    return (
        <Panel
            title={
                <div className="flex justify-between gap-1">
                    <div>Paths · {Object.values(paths).length}</div>
                    <Button
                        icon={<PlusLinear className="w-4 h-4" />}
                        onClick={() => {
                            addPath("New Path", "#000000");
                        }}
                        className="mb-2 text-xs font-normal"
                        color="blue"
                    >
                        New
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-1 p-2">
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
            </div>
        </Panel>
    );
}

const SortablePathRow = memo(({ pathId }: { pathId: number }) => {
    const path = usePathStore((state) => state.paths.find((p) => p.id === pathId))!;
    const deletePath = usePathStore((state) => state.deletePath);
    const { selectEntity } = useSelectionActions();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: path.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-col gap-1 border bg-gray-50 border-none rounded-md py-1"
        >
            <div className="flex flex-row gap-2 items-center text-sm">
                <div {...attributes} {...listeners} className="cursor-grab p-1 select-none">
                    <GripDotsVerticalLinear className="text-gray-400" height={17} />
                </div>
                <div
                    className="flex items-center justify-between w-full pr-2 group cursor-pointer"
                    onClick={() => {
                        selectEntity("path", path.id);
                    }}
                >
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16">
                            <circle cx="8" cy="8" r="7" fill={path.color} stroke={path.outlineColor} />
                        </svg>
                        <div>{pathId}</div>
                        <div>{path.name}</div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            deletePath(path.id);
                        }}
                        className="disabled:opacity-50 hover:text-red-600 disabled:hover:text-red-500 hidden group-hover:block cursor-pointer"
                    >
                        <TrashLinear className="w-5 h-5 text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
});
