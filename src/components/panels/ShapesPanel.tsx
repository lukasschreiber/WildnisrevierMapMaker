import { usePathStore } from "../../stores/usePaths";
import { useShapeStore } from "../../stores/useShapes";
import { useWaypointStore } from "../../stores/useWaypoints";
import { Checkbox } from "../inputs/Checkbox";
import { ColorInput } from "../inputs/ColorInput";
import { NumberInput } from "../inputs/NumberInput";
import { Select } from "../inputs/Select";
import { TextInput } from "../inputs/TextInput";

export function ShapesPanel() {
    const shapes = useShapeStore((state) => state.shapes);
    const addShape = useShapeStore((state) => state.addShape);
    const updateShape = useShapeStore((state) => state.updateShape);
    const setAddMode = useShapeStore((state) => state.setAddMode);
    const addMode = useShapeStore((state) => state.addMode);
    const addModeReferenceShapeId = useShapeStore((state) => state.addModeReferenceShapeId);
    const setAddModeReferenceShapeId = useShapeStore((state) => state.setAddModeReferenceShapeId);
    const removeShape = useShapeStore((state) => state.removeShape);

    const setAddWaypointMode = useWaypointStore((state) => state.setAddMode);
    const setAddPathsMode = usePathStore((state) => state.setAddMode);

    return (
        <div className="flex flex-col gap-2">
            <div className="font-bold text-sm mb-2">Shapes - {shapes.length}</div>
            {shapes.map((shape) => (
                <div key={shape.id} className="flex flex-row gap-2 items-center">
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
                    <button
                        onClick={() => removeShape(shape.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded"
                    >
                        Delete
                    </button>
                </div>
            ))}
            <button
                onClick={() => addShape("New Shape", "#000000")}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Shape
            </button>
        </div>
    );
}
