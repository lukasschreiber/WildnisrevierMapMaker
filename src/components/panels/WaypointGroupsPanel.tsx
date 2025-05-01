import { useWaypointGroupStore } from "../../stores/useGroups";
import { Checkbox } from "../inputs/Checkbox";
import { TextInput } from "../inputs/TextInput";

export function WaypointGroupsPanel() {
    const waypointGroups = useWaypointGroupStore((state) => state.waypointGroups);
    const addWaypointGroup = useWaypointGroupStore((state) => state.addWaypointGroup);
    const removeWaypointGroup = useWaypointGroupStore((state) => state.removeWaypointGroup);
    const updateWaypointGroup = useWaypointGroupStore((state) => state.updateWaypointGroup);
    const isDeletable = useWaypointGroupStore((state) => state.isDeletable);

    const handleAddGroup = () => {
        const newGroup = { id: Date.now(), name: "New Group", hidden: false };
        addWaypointGroup(newGroup);
    };

    return (
        <div className="flex flex-col gap-2">
            {waypointGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-2">
                    <TextInput
                        value={group.name}
                        onChange={(value) => updateWaypointGroup(group.id, { name: value })}
                    />
                    <Checkbox
                        label="Hidden"
                        value={group.hidden}
                        onChange={(value) => updateWaypointGroup(group.id, { hidden: value })}
                    />
                    <button
                        onClick={() => removeWaypointGroup(group.id)}
                        disabled={!isDeletable(group.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-red-500"
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button
                onClick={handleAddGroup}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
                Add Group
            </button>
        </div>
    );
}
