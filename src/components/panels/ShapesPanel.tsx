import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";
import { useWaypointStore } from "../../stores/useWaypoints";
import { Checkbox } from "../inputs/Checkbox";
import { ColorInput } from "../inputs/ColorInput";
import { NumberInput } from "../inputs/NumberInput";
import { Select } from "../inputs/Select";
import { TextInput } from "../inputs/TextInput";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import React, { useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";

export function ShapesPanel() {
    const shapes = useShapeStore((state) => state.shapes);
    const addShape = useShapeStore((state) => state.addShape);
    const updateShape = useShapeStore((state) => state.updateShape);

    const sensors = useSensors(useSensor(PointerSensor));

    const sortedShapes = useMemo(() => {
        return [...shapes].sort((a, b) => {
            const orderA = a.order ?? 0;
            const orderB = b.order ?? 0;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return a.id.toString().localeCompare(b.id.toString());
        });
    }, [shapes]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sortedShapes.findIndex((s) => s.id === active.id);
        const newIndex = sortedShapes.findIndex((s) => s.id === over.id);

        if (oldIndex !== newIndex) {
            const reordered = arrayMove(sortedShapes, oldIndex, newIndex);
            reordered.forEach((shape, index) => {
                updateShape(shape.id, { order: index });
            });
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="font-bold text-sm mb-2">Shapes - {shapes.length}</div>
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
                <SortableContext items={sortedShapes.map((shape) => shape.id)} strategy={verticalListSortingStrategy}>
                    {sortedShapes.map((shape) => (
                        <SortableShapeRow key={shape.id} shapeId={shape.id} />
                    ))}
                </SortableContext>
            </DndContext>
            <button
                onClick={() => addShape("New Shape", "#000000")}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Shape
            </button>
        </div>
    );
}

const SortableShapeRow = React.memo(({ shapeId }: { shapeId: number }) => {
    const shape = useShapeStore((state) => state.shapes.find((s) => s.id === shapeId))!;
    const setAddMode = useShapeStore((state) => state.setAddMode);
    const addMode = useShapeStore((state) => state.addMode);
    const addModeReferenceShapeId = useShapeStore((state) => state.addModeReferenceShapeId);
    const setAddModeReferenceShapeId = useShapeStore((state) => state.setAddModeReferenceShapeId);
    const removeShape = useShapeStore((state) => state.removeShape);
    const updateShape = useShapeStore((state) => state.updateShape);

    const setAddWaypointMode = useWaypointStore((state) => state.setAddMode);
    const setAddPathsMode = usePathStore((state) => state.setAddMode);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: shape.id });

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
                <TextInput value={shape.name} onChange={(value) => updateShape(shape.id, { name: value })} />
                <Select
                    value={shape.shapeType}
                    onChange={(value) => updateShape(shape.id, { shapeType: value })}
                    options={[
                        { label: "Smooth", value: "smooth" },
                        { label: "Straight", value: "straight" },
                    ]}
                />
                <NumberInput
                    value={shape.alpha}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(value) => updateShape(shape.id, { alpha: value })}
                    className="max-w-14"
                    placeholder="Alpha"
                />
                <Select
                    value={shape.texture || "solid"}
                    onChange={(value) => updateShape(shape.id, { texture: value })}
                    options={[
                        { label: "None", value: "none" },
                        { label: "Solid", value: "solid" },
                        { label: "Gradient", value: "gradient" },
                        { label: "Lines", value: "lines" },
                        { label: "Dots", value: "dots" },
                        { label: "Checkered", value: "checkered" },
                        { label: "Chessboard", value: "chessboard" },
                        { label: "Crosses", value: "crosses" },
                    ]}
                />
                <ColorInput value={shape.color} onChange={(value) => updateShape(shape.id, { color: value })} />
                <Checkbox
                    id={shape.id.toString()}
                    label="Has Outline"
                    value={shape.hasOutline}
                    onChange={(checked) => updateShape(shape.id, { hasOutline: checked })}
                />
                <Checkbox
                    id={`${shape.id}-hidden`}
                    label="Hidden"
                    value={shape.hidden}
                    onChange={(checked) => updateShape(shape.id, { hidden: checked })}
                />
                <div>{shape.nodes?.length} points</div>
                <button
                    onClick={() => {
                        setAddMode(!addMode);
                        setAddPathsMode(false);
                        setAddWaypointMode(false);
                        setAddModeReferenceShapeId(shape.id);
                    }}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded"
                >
                    {addMode && addModeReferenceShapeId === shape.id ? "Cancel" : "Edit Points"}
                </button>
                <button onClick={() => removeShape(shape.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded">
                    Delete
                </button>
            </div>
            {/* <div className="flex flex-row gap-1 pl-6">
                {shape.nodes?.map((node) => (
                    <div key={node.waypointId} className="flex flex-row gap-2 items-center">
                        <div className="text-xs">{node.waypointId}</div>
                        <button
                        onClick={() => {
                            updateShape(shape.id, {
                                nodes: shape.nodes.filter((n) => n.waypointId !== node.waypointId),
                            });
                        }}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded"
                    >
                        Remove Node
                    </button>
                    </div>
                ))}
            </div> */}
        </div>
    );
}, areEqual);

function areEqual(prevProps: any, nextProps: any) {
    return prevProps.shapeId === nextProps.shapeId;
}
