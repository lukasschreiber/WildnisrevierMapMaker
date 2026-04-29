import { useNavigate, useParams } from "react-router";
import { Panel } from "../MainPanel";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { LegendWaypointMarker } from "../../components/legend/LegendWaypointMarker";
import TypeIcon from "../../assets/icons/shapes.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import CloneIcon from "../../assets/icons/clone.svg?react";
import FolderPlusIcon from "../../assets/icons/folder-plus.svg?react";
import { IconButton } from "../controls/IconButton";
import { TextInput } from "../controls/TextInput";
import { Divider } from "../common/Divider";
import { Select } from "../controls/Select";
import { useWaypointGroupStore } from "../../stores/useGroups";
import { EyeLinear, EyeSlashLinear } from "@lukasschreiber/icons";

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
    const waypointGroups = useWaypointGroupStore((state) => state.waypointGroups);
    const updateWaypointName = useWaypointStore((state) => state.updateWaypointName);
    const updateWaypointAdditionalText = useWaypointStore((state) => state.updateWaypointAdditionalText);
    const updateWaypointType = useWaypointStore((state) => state.updateWaypointType);
    const updateWaypointGroup = useWaypointStore((state) => state.updateWaypointGroup);
    const toggleWaypointHidden = useWaypointStore((state) => state.toggleWaypointHidden);
    const isDeletable = useWaypointStore((state) => state.isDeletable);
    const navigate = useNavigate();

    if (!waypoint) {
        return <div>Error: Waypoint not found</div>;
    }

    const type = types[waypoint.typeId];

    const topBackground = type.hasTwoColors
        ? `linear-gradient(${type.rotation ?? 0}deg, ${type.color2} 0 50%, ${type.color || "#000000"} 50% 100%)`
        : type.color;

    return (
        <Panel topComponent={<div className="h-full w-full opacity-30" style={{ background: topBackground }} />}>
            <div className="flex items-center gap-2 p-4">
                <LegendWaypointMarker type={types[waypoint.typeId]} radius={14} borderWidth={1} borderColor="black" />
                <div className="flex flex-col">
                    <span className="text-md font-semibold">
                        {`Waypoint ${waypoint.id}`} {waypoint.name && "· " + waypoint.name}
                    </span>
                    <span className="text-sm text-gray-500">{type.name}</span>
                </div>
            </div>
            <Divider />
            <div className="px-4 py-2 flex gap-2 items-center justify-center">
                <IconButton
                    icon={<TypeIcon className="w-5 h-5" />}
                    onClick={() => {
                        navigate(`/type/${type.id}`);
                    }}
                    color="blue"
                    label="Edit Type"
                />
                <IconButton
                    icon={<FolderPlusIcon className="w-5 h-5" />}
                    onClick={() => {}}
                    color="blue"
                    label="Add to Group"
                />
                <IconButton
                    icon={waypoint.hidden ? <EyeLinear className="w-5 h-5" /> : <EyeSlashLinear className="w-5 h-5" />}
                    onClick={() => {
                        toggleWaypointHidden(waypoint.id);
                    }}
                    label={waypoint.hidden ? "Show" : "Hide"}
                />
                <IconButton icon={<CloneIcon className="w-5 h-5" />} onClick={() => {}} label="Duplicate" />
                <IconButton
                    icon={<TrashIcon className="w-5 h-5" />}
                    disabled={!isDeletable(Number(waypointId))}
                    onClick={() => {}}
                    color="red"
                    label="Delete"
                />
            </div>
            <Divider />
            <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
                <TextInput
                    label="Waypoint Name"
                    value={waypoint.name || ""}
                    onChange={(value) => updateWaypointName(waypoint.id, value)}
                />
                {type.additionalText && (
                    <TextInput
                        label="Additional Text"
                        value={waypoint.additionalText || ""}
                        onChange={(value) => updateWaypointAdditionalText(waypoint.id, value)}
                        placeholder="Additional Text"
                        helpText="This text is shown inside of the Waypoint"
                    />
                )}
                <Select
                    label="Waypoint Type"
                    className="w-full"
                    value={waypoint.typeId}
                    onChange={(value) => updateWaypointType(waypoint.id, value)}
                    helpText="The type determines the look of a waypoint"
                    options={Object.values(types).map((type) => ({
                        value: type.id,
                        children: (
                            <div className="flex items-center gap-2">
                                <LegendWaypointMarker type={type} radius={8} borderWidth={1} borderColor="black" />
                                <span>{type.name}</span>
                            </div>
                        ),
                    }))}
                />
                <Select
                    label="Group"
                    className="w-full"
                    value={waypoint.groupId ?? ""}
                    onChange={(value) => {
                        const groupId = value === "" ? undefined : value;
                        updateWaypointGroup(waypoint.id, groupId);
                    }}
                    options={[
                        { children: "No Group", value: "" },
                        ...waypointGroups.map((group) => ({ children: group.name, value: group.id })),
                    ]}
                    helpText="Grouping waypoints helps hiding them in bulk"
                />
            </div>
            <Divider />
            <div className="flex p-2 flex-col">
                <span className="text-sm text-gray-500 italic">Exact Position:</span>
                <div className="text-sm text-gray-800">
                    Lat: {waypoint.lat.toFixed(6)}, Lng: {waypoint.lng.toFixed(6)}
                </div>
                <div className="py-2 flex gap-2 items-center">
                    <IconButton
                        icon={
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Google_Maps_icon_%282026%29.svg"
                                className="h-5"
                            />
                        }
                        onClick={() => {
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=${waypoint.lat},${waypoint.lng}`,
                                "_blank",
                            );
                        }}
                        label="Google Maps"
                    />
                    <IconButton
                        icon={
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/1/15/OpenStreetMap_icon_simple.svg"
                                className=" h-5"
                            />
                        }
                        onClick={() => {
                            window.open(
                                `https://www.openstreetmap.org/?mlat=${waypoint.lat}&mlon=${waypoint.lng}#map=18/${waypoint.lat}/${waypoint.lng}`,
                                "_blank",
                            );
                        }}
                        label="OpenStreetMap"
                    />
                    <IconButton
                        icon={
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Mapy_icon.svg"
                                className="h-5"
                            />
                        }
                        label="Mapy.cz"
                        onClick={() => {
                            window.open(
                                `https://mapy.com/fnc/v1/showmap?mapset=base&center=${waypoint.lng},${waypoint.lat}&zoom=18&marker=true`,
                                "_blank",
                            );
                        }}
                    />
                    <IconButton
                        icon={
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                                className="h-5"
                            />
                        }
                        label="Apple Maps"
                        onClick={() => {
                            window.open(`https://maps.apple.com/?q=${waypoint.lat},${waypoint.lng}&z=18`, "_blank");
                        }}
                    />
                </div>
            </div>
        </Panel>
    );
}
