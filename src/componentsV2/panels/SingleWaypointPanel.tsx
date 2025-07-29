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

    if (!waypoint) {
        return <div>Error: Waypoint not found</div>;
    }

    const type = types[waypoint.typeId];

    return (
        <Panel topColor="#d1d5dc">
            <div className="flex items-center gap-2 p-4">
                <LegendWaypointMarker type={types[waypoint.typeId]} radius={14} borderWidth={1} borderColor="black" />
                <div className="flex flex-col">
                    <span className="text-md font-semibold">{waypoint.name || `Waypoint ${waypoint.id}`}</span>
                    <span className="text-sm text-gray-500">{type.name}</span>
                </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="px-4 py-2 flex gap-2 items-center justify-center">
                <div className="rounded-full bg-blue-200 text-blue-900 hover:bg-blue-300 cursor-pointer px-2 py-1 text-xs w-10 h-10 flex items-center justify-center">
                    <TypeIcon className="w-5 h-5" />
                </div>
                <div className="rounded-full bg-blue-200 text-blue-900 hover:bg-blue-300 cursor-pointer px-2 py-1 text-xs w-10 h-10 flex items-center justify-center">
                    <FolderPlusIcon className="w-5 h-5" />
                </div>
                <div className="rounded-full bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer px-2 py-1 text-xs w-10 h-10 flex items-center justify-center">
                    <EyeIcon className="w-5 h-5" />
                </div>
                <div className="rounded-full bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer px-2 py-1 text-xs w-10 h-10 flex items-center justify-center">
                    <CloneIcon className="w-5 h-5" />
                </div>
                <div className="rounded-full bg-red-200 text-red-900 hover:bg-red-300 cursor-pointer px-2 py-1 text-xs w-10 h-10 flex items-center justify-center">
                    <TrashIcon className="w-5 h-5" />
                </div>
            </div>
            <div className="border-t border-gray-200" />
            waypoint.name: {waypoint.name || "No name"} <br />
            waypoint.additionalText: {waypoint.additionalText || "No additional text"} <br />
            waypoint.id: {waypoint.id} <br />
        </Panel>
    );
}
