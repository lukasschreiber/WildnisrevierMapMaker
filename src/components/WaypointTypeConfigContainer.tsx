import { useWaypointTypeContext } from "../context/WaypointTypeContext";

export function WaypointTypeConfigContainer() {
    const { waypointTypes, updateWaypointType, addWaypointType, removeWaypointType, isDeletable } = useWaypointTypeContext();

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Waypoint Types</h2>
            {waypointTypes.map((type) => (
                <div key={type.id} className="flex flex-row gap-2 items-center">
                    <input
                        type="text"
                        value={type.name}
                        onChange={(e) => updateWaypointType(type.id, { name: e.target.value })}
                        className="bg-black/20 p-1 rounded-md"
                    />
                    <select
                        value={type.icon}
                        onChange={(e) =>
                            updateWaypointType(type.id, {
                                icon: e.target.value as "circle" | "square" | "triangle" | "star",
                            })
                        }
                        className="bg-black/20 p-1 rounded-md"
                    >
                        <option value="circle">Circle</option>
                        <option value="square">Square</option>
                        <option value="triangle">Triangle</option>
                        <option value="star">Star</option>
                        <option value="cross">Cross</option>
                        <option value="diamond">Diamond</option>
                        <option value="apple">Apple</option>
                        <option value="cherry">Cherry</option>
                        <option value="pear">Pear</option>
                        <option value="plum">Plum</option>
                    </select>
                    <input
                        type="color"
                        value={type.color}
                        onChange={(e) => updateWaypointType(type.id, { color: e.target.value })}
                        className="bg-black/20 p-1 rounded-md"
                    />
                    {type.hasTwoColors && (
                        <input 
                            type="color"
                            value={type.color2}
                            onChange={(e) => updateWaypointType(type.id, { color2: e.target.value })}
                            className="bg-black/20 p-1 rounded-md"
                        />
                    )}
                    <input
                        type="checkbox"
                        id={type.id.toString()}
                        checked={type.hidden}
                        onChange={(e) => updateWaypointType(type.id, { hidden: e.target.checked })}
                        className="bg-black/20 p-1 rounded-md"
                    />
                    <label className="text-xs" htmlFor={type.id.toString()}>Hidden</label>
                    <input
                        type="checkbox"
                        id={`${type.id}-two-colors`}
                        checked={type.hasTwoColors}
                        onChange={(e) => updateWaypointType(type.id, { hasTwoColors: e.target.checked })}
                        className="bg-black/20 p-1 rounded-md"
                    />
                    <label className="text-xs" htmlFor={`${type.id}-two-colors`}>Two Colors</label>
                    <button
                        onClick={() => removeWaypointType(type.id)}
                        disabled={waypointTypes.length <= 1 || type.id === 1 || !isDeletable(type.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-red-500"
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button
                onClick={() => addWaypointType({ id: Date.now(), name: "New Type", icon: "circle", color: "#000000", hidden: false, hasTwoColors: false })}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Waypoint Type
            </button>
        </div>
    );
}
