import { usePathContext } from "../context/PathContext";
import { useShapeContext } from "../context/ShapeContext";
import { useWaypointContext } from "../context/WaypointContext";

export function ShapeContainer() {
    const {
        shapes,
        addShape,
        updateShape,
        setAddMode,
        addMode,
        addModeReferenceShapeId,
        setAddModeReferenceShapeId,
        removeShape,
    } = useShapeContext();
    const { setAddMode: setAddWaypointMode } = useWaypointContext();
    const { setAddMode: setAddPathsMode } = usePathContext();

    return (
        <div className="flex flex-col gap-2">
            <div className="font-bold text-sm mb-2">Shapes - {shapes.length}</div>
            {shapes.map((shape) => (
                <div key={shape.id} className="flex flex-row gap-2 items-center">
                    <input
                        type="text"
                        value={shape.name}
                        onChange={(e) => updateShape(shape.id, { name: e.target.value })}
                        className="bg-black/50 p-1 rounded-md"
                    />
                    <select
                        value={shape.shapeType}
                        onChange={(e) => updateShape(shape.id, { shapeType: e.target.value as "smooth" | "straight" })}
                        className="bg-black/50 p-1 rounded-md"
                    >
                        <option value="smooth">Smooth</option>
                        <option value="straight">Straight</option>
                    </select>
                    <input
                        type="number"
                        value={shape.alpha}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(e) => updateShape(shape.id, { alpha: parseFloat(e.target.value) })}
                        className="bg-black/50 p-1 rounded-md max-w-14"
                        placeholder="Alpha"
                    />
                    <select
                        value={shape.texture}
                        onChange={(e) => updateShape(shape.id, { texture: e.target.value })}
                        className="bg-black/50 p-1 rounded-md"
                    >
                        <option value="solid">Solid</option>
                        <option value="gradient">Gradient</option>
                        <option value="lines">Lines</option>
                        <option value="dots">Dots</option>
                        <option value="checkered">Checkered</option>
                        <option value="chessboard">Chessboard</option>
                        <option value="crosses">Crosses</option>
                    </select>
                    <input
                        type="color"
                        value={shape.color}
                        onChange={(e) => updateShape(shape.id, { color: e.target.value })}
                        className="bg-black/50 p-1 rounded-md"
                    />
                    <input
                        type="checkbox"
                        id={shape.id.toString()}
                        checked={shape.hasOutline}
                        onChange={(e) => updateShape(shape.id, { hasOutline: e.target.checked })}
                        className="bg-black/50 p-1 rounded-md"
                    />
                    <label className="text-xs" htmlFor={shape.id.toString()}>
                        Has Outline
                    </label>
                    <div>{shape.nodes?.length} points</div>
                    <button
                        onClick={() => {
                            setAddMode((old) => !old);
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
