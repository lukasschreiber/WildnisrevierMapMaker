import { useNavigate } from "react-router";
import { Panel } from "../Panel";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { LegendWaypointMarker } from "../legend/LegendWaypointMarker";
import { IconButton } from "../controls/IconButton";
import { TextInput } from "../controls/TextInput";
import { Divider } from "../common/Divider";
import { Select } from "../controls/Select";
import { useWaypointGroupStore } from "../../stores/useGroups";
import {
    CloneLinear,
    EyeLinear,
    EyeSlashLinear,
    FolderPlusLinear,
    ShapesLinear,
    TrashLinear,
} from "@lukasschreiber/icons";
import { waypointActions } from "../../domain/actions/waypoints";
import { useInteractionsStore } from "../../stores/useInteractions";
import { useUrlState } from "../../hooks/useUrlState";

export interface SingleWaypointPanelProps {
    id: number;
}

export function SingleWaypointPanel({ id }: SingleWaypointPanelProps) {
    const waypoint = useWaypointStore((state) => state.waypoints.find((wp) => wp.id === id));
    const types = useWaypointTypeStore((state) => state.types);
    const waypointGroups = useWaypointGroupStore((state) => state.waypointGroups);
    const deselect = useInteractionsStore((state) => state.deselect);
    const isDeletable = useWaypointStore((state) => state.isDeletable);
    const navigate = useNavigate();
    const { setActive } = useUrlState();

    if (!waypoint) {
        return <div>Error: Waypoint not found</div>;
    }

    const typeId = Number(waypoint.typeId);
    const type = types[typeId];

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
                    icon={<ShapesLinear className="w-5 h-5" />}
                    onClick={() => {
                        setActive({
                            type: "waypoint-type",
                            id: waypoint.id,
                        });
                    }}
                    color="blue"
                    label="Edit Type"
                />
                <IconButton
                    icon={<FolderPlusLinear className="w-5 h-5" />}
                    onClick={() => {}}
                    color="blue"
                    label="Add to Group"
                />
                <IconButton
                    icon={waypoint.hidden ? <EyeLinear className="w-5 h-5" /> : <EyeSlashLinear className="w-5 h-5" />}
                    onClick={() => {
                        waypointActions.updateWaypoint(waypoint.id, { hidden: !waypoint.hidden });
                    }}
                    label={waypoint.hidden ? "Show" : "Hide"}
                />
                <IconButton icon={<CloneLinear className="w-5 h-5" />} onClick={() => {}} label="Duplicate" />
                <IconButton
                    icon={<TrashLinear className="w-5 h-5" />}
                    disabled={!isDeletable(id)}
                    onClick={() => {
                        if (!isDeletable(waypoint.id)) {
                            return;
                        }

                        waypointActions.deleteWaypointWithDependencies(waypoint.id);
                        deselect("waypoint", waypoint.id);
                        navigate("/");
                    }}
                    color="red"
                    label="Delete"
                />
            </div>
            <Divider />
            <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
                <TextInput
                    label="Waypoint Name"
                    value={waypoint.name || ""}
                    onChange={(value) => waypointActions.updateWaypoint(waypoint.id, { name: value })}
                />
                {type.additionalText && (
                    <TextInput
                        label="Additional Text"
                        value={waypoint.additionalText || ""}
                        onChange={(value) => waypointActions.updateWaypoint(waypoint.id, { additionalText: value })}
                        placeholder="Additional Text"
                        helpText="This text is shown inside of the Waypoint"
                    />
                )}
                <Select
                    label="Waypoint Type"
                    className="w-full"
                    value={typeId}
                    onChange={(value) => waypointActions.updateWaypoint(waypoint.id, { typeId: value })}
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
                        waypointActions.updateWaypoint(waypoint.id, { groupId });
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
