import { usePathContext } from "../../context/PathContext";

export function PathsPanel() {
    const { segments } = usePathContext();
    return (
        <div>
            <div className="font-bold text-sm mb-2">Paths - {segments.length}</div>
            {segments.map((segment) => (
                <div key={segment.id} className="flex flex-row gap-2 items-center">
                    <span>
                        {segment.from.waypointId} - {segment.to.waypointId}
                    </span>
                </div>
            ))}
        </div>
    );
}
