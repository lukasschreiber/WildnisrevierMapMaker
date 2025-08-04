import { useParams } from "react-router";
import { Panel } from "../MainPanel";
import { LegendWaypointMarker } from "../../components/legend/LegendWaypointMarker";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { TextInput } from "../controls/TextInput";

export interface SingleWaypointTypePanelProps {
    waypointTypeId: number;
}

export function SingleWaypointTypePanelWrapper() {
    const params = useParams();
    if (!params.id) {
        return <div>Error: No waypoint type ID provided</div>;
    }
    return <SingleWaypointTypePanel waypointTypeId={parseInt(params.id)} />;
}

export function SingleWaypointTypePanel({ waypointTypeId }: SingleWaypointTypePanelProps) {
    const type = useWaypointTypeStore((state) => state.types[waypointTypeId]);
    const updateType = useWaypointTypeStore((state) => state.updateType);

    return (
        <Panel topColor="#d1d5dc">
            <div className="p-4 flex items-center flex-col gap-2">
                <LegendWaypointMarker type={type} radius={32} borderWidth={2} borderColor="black" />
                <div className="text-sm text-gray-800 font-bold">{type.name}</div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="p-4 text-sm text-gray-600">
                <TextInput
                    label="Type Name"
                    value={type.name || ""}
                    onChange={(e) => updateType(waypointTypeId, { name: e.target.value })}
                />
            </div>
        </Panel>
    );
}
