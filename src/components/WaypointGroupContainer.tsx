import { useWaypointGroupContext } from "../context/WaypointGroupContext";

export function WaypointGroupContainer() {
    const { waypointGroups, updateWaypointGroup, addWaypointGroup, removeWaypointGroup, isDeletable } = useWaypointGroupContext();

    const handleAddGroup = () => {
        const newGroup = { id: Date.now(), name: "New Group", hidden: false };
        addWaypointGroup(newGroup);
    };

    return (
        <div className="flex flex-col gap-2">
            {waypointGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateWaypointGroup(group.id, { name: e.target.value })}
                        className="bg-black/50 p-1 rounded-md"
                    />
                    <input
                        type="checkbox"
                        id={group.id.toString()}
                        checked={group.hidden}
                        onChange={(e) => updateWaypointGroup(group.id, { hidden: e.target.checked })}
                        className="bg-black/50 p-1 rounded-md"
                    />
                    <label className="text-xs" htmlFor={group.id.toString()}>Hidden</label>
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
