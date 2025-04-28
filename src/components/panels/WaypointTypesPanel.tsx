import { memo } from "react";
import { useWaypointTypeContext, WaypointType } from "../../context/WaypointTypeContext";
import { Select } from "../inputs/Select";
import { TextInput } from "../inputs/TextInput";
import { NumberInput } from "../inputs/NumberInput";
import { Checkbox } from "../inputs/Checkbox";
import { ColorInput } from "../inputs/ColorInput";

export function WaypointTypesPanel() {
    const { waypointTypes, addWaypointType } = useWaypointTypeContext();

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Waypoint Types</h2>
            {waypointTypes.map((type) => (
                <MemoizedWaypointTypeListItem key={type.id} type={type}  />
            ))}
            <button
                onClick={() =>
                    addWaypointType({
                        id: Date.now(),
                        name: "New Type",
                        icon: "circle",
                        color: "#000000",
                        hidden: false,
                        hasTwoColors: false,
                    })
                }
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Waypoint Type
            </button>
        </div>
    );
}

const MemoizedWaypointTypeListItem = memo(WaypointTypeListItem);

export function WaypointTypeListItem({ type }: { type: WaypointType }) {
    const { waypointTypes, updateWaypointType, removeWaypointType, isDeletable } = useWaypointTypeContext();

    if (!type) return null;

    return (
        <div key={type.id} className="flex flex-row gap-2 items-center">
            <TextInput
                value={type.name}
                onChange={(value) => updateWaypointType(type.id, { name: value })}
            />
            <Select
                value={type.icon}
                onChange={(value) => updateWaypointType(type.id, { icon: value })}
                options={[
                    { label: "Circle", value: "circle" },
                    { label: "Square", value: "square" },
                    { label: "Triangle", value: "triangle" },
                    { label: "Star", value: "star" },
                    { label: "Cross", value: "cross" },
                    { label: "Diamond", value: "diamond" },
                    { label: "Apple", value: "apple" },
                    { label: "Cherry", value: "cherry" },
                ]}
            />
            <NumberInput
                value={type.radiusOverride ?? "" as unknown as number}
                min={-1}
                max={100}
                onChange={(value) =>
                    updateWaypointType(type.id, {
                        radiusOverride: value < 0 ? undefined : value,
                    })
                }
                className="bg-black/50 p-1 rounded-md max-w-12"
                placeholder="size"
            />
            <ColorInput
                value={type.color}
                onChange={(value) => updateWaypointType(type.id, { color: value })}
                className="bg-black/50 p-1 rounded-md"
            />
            <ColorInput
                value={type.color2 || "#000000"}
                onChange={(value) => updateWaypointType(type.id, { color2: value })}
                disabled={!type.hasTwoColors}
            />
            <Checkbox
                label="Hidden"
                value={type.hidden}
                onChange={(value) => updateWaypointType(type.id, { hidden: value })}
            />
            <Checkbox
                label="Two Colors"
                value={type.hasTwoColors}
                onChange={(value) => updateWaypointType(type.id, { hasTwoColors: value })}
            />
            <button
                onClick={() => removeWaypointType(type.id)}
                disabled={waypointTypes.length <= 1 || type.id === 1 || !isDeletable(type.id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-red-500"
            >
                Remove
            </button>
        </div>
    );
}
