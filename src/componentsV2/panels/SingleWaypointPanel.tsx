import { useParams } from "react-router";
import { Panel } from "../MainPanel";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { LegendWaypointMarker } from "../../components/legend/LegendWaypointMarker";
import TypeIcon from "../../assets/icons/shapes.svg?react";
import EyeIcon from "../../assets/icons/eye.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import CloneIcon from "../../assets/icons/clone.svg?react";
import FolderPlusIcon from "../../assets/icons/folder-plus.svg?react";
import { IconButton } from "../controls/IconButton";
import { TextInput } from "../controls/TextInput";

export interface SingleWaypointPanelProps {
    waypointId: string;
}

export function SingleWaypointPanelWrapper() {
    const params = useParams();
    if (!params.id) {
        return <div>Error: No waypoint ID provided</div>;
    }
    return <SingleWaypointPanel waypointId={params.id} />;
}

export function SingleWaypointPanel({ waypointId }: SingleWaypointPanelProps) {
    const waypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id.toString() === waypointId));
    const types = useWaypointTypeStore((state) => state.types);
    const updateWaypointName = useWaypointStore((state) => state.updateWaypointName);
    const updateWaypointAdditionalText = useWaypointStore((state) => state.updateWaypointAdditionalText);

    if (!waypoint) {
        return <div>Error: Waypoint not found</div>;
    }

    const type = types[waypoint.typeId];

    return (
        <Panel topColor="#d1d5dc">
            <div className="flex items-center gap-2 p-4">
                <LegendWaypointMarker type={types[waypoint.typeId]} radius={14} borderWidth={1} borderColor="black" />
                <div className="flex flex-col">
                    <span className="text-md font-semibold">{`Waypoint ${waypoint.id}`} {waypoint.name && "- " + waypoint.name}</span>
                    <span className="text-sm text-gray-500">{type.name}</span>
                </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="px-4 py-2 flex gap-2 items-center justify-center">
                <IconButton icon={<TypeIcon className="w-5 h-5" />} onClick={() => {}} color="blue" label="Edit Type" />
                <IconButton icon={<FolderPlusIcon className="w-5 h-5" />} onClick={() => {}} color="blue" label="Add to Group" />
                <IconButton icon={<EyeIcon className="w-5 h-5" />} onClick={() => {}} label="Hide" />
                <IconButton icon={<CloneIcon className="w-5 h-5" />} onClick={() => {}} label="Duplicate" />
                <IconButton icon={<TrashIcon className="w-5 h-5" />} onClick={() => {}} color="red" label="Delete" />
            </div>
            <div className="border-t border-gray-200" />
            <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
                <TextInput
                    label="Waypoint Name"
                    value={waypoint.name || ""}
                    onChange={(e) => updateWaypointName(waypoint.id, e.target.value)}
                />
                {waypoint.additionalText && <TextInput
                    label="Waypoint Additional Text"
                    value={waypoint.additionalText || ""}
                    onChange={(e) => updateWaypointAdditionalText(waypoint.id, e.target.value)}
                />}
            </div>
            <div className="border-t border-gray-200" />

        </Panel>
    );
}
