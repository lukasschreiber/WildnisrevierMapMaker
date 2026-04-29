import { useNavigate, useParams } from "react-router";
import { Panel } from "../MainPanel";
import { LegendWaypointMarker } from "../../components/legend/LegendWaypointMarker";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { TextInput } from "../controls/TextInput";
import { CloneLinear, EyeLinear, EyeSlashLinear, PenLineSolid, TrashLinear } from "@lukasschreiber/icons";
import { Divider } from "../common/Divider";
import { Select } from "../controls/Select";
import { NumberInput } from "../controls/NumberInput";
import { Checkbox } from "../controls/Checkbox";
import { ColorInput } from "../controls/ColorInput";
import { IconButton } from "../controls/IconButton";
import { useWaypointStore } from "../../stores/useWaypoints";

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
    const navigate = useNavigate();
    const numberOfWaypointsUsingThisType = useWaypointStore(
        (state) => state.waypoints.filter((wp) => wp.typeId == waypointTypeId).length,
    );
    const removeType = useWaypointTypeStore((state) => state.removeType);
    const isDeletable = useWaypointTypeStore((state) => state.isDeletable);
    const addType = useWaypointTypeStore((state) => state.addType);
    const updateType = useWaypointTypeStore((state) => state.updateType);

    const getCopyName = (name: string) => {
        const baseName = name.replace(/\s+\(Copy(?: \d+)?\)$/, "");

        const copyNumbers = Object.values(useWaypointTypeStore.getState().types)
            .map((t) => {
                const match = t.name.match(
                    new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(Copy(?: (\\d+))?\\)$`),
                );
                return match ? Number(match[1] ?? 1) : null;
            })
            .filter((n): n is number => n !== null);

        const nextCopyNumber = copyNumbers.length ? Math.max(...copyNumbers) + 1 : 1;

        return `${baseName} (Copy ${nextCopyNumber})`;
    };

    const topBackground = type.hasTwoColors
        ? `linear-gradient(${type.rotation ?? 0}deg, ${type.color2} 0 50%, ${type.color || "#000000"} 50% 100%)`
        : type.color;

    return (
        <Panel topComponent={<div className="h-full w-full opacity-30" style={{ background: topBackground }} />}>
            <div className="p-4 flex items-center flex-col">
                <LegendWaypointMarker type={type} radius={32} borderWidth={2} borderColor="black" />
                <div className="text-lg text-gray-800 font-medium flex items-center gap-2 mt-2">
                    {type.name}
                    <PenLineSolid className="text-blue-500" size={18} />
                </div>
                <div className="text-sm text-gray-500 italic">
                    {numberOfWaypointsUsingThisType} waypoint{numberOfWaypointsUsingThisType !== 1 && "s"} use
                    {numberOfWaypointsUsingThisType === 1 && "s"} this type.
                </div>
            </div>
            <Divider />
            <div className="px-4 py-2 flex gap-2 items-center justify-center">
                <IconButton
                    icon={type.hidden ? <EyeLinear className="w-5 h-5" /> : <EyeSlashLinear className="w-5 h-5" />}
                    onClick={() => {
                        updateType(type.id, { hidden: !type.hidden });
                    }}
                    label={type.hidden ? "Show" : "Hide"}
                />
                <IconButton
                    icon={<CloneLinear className="w-5 h-5" />}
                    onClick={() => {
                        const id = Date.now();

                        const clone = {
                            ...type,
                            id,
                            name: getCopyName(type.name),
                        };

                        addType(clone);
                        alert("Type duplicated.");
                        navigate(`/type/${id}`);
                    }}
                    label="Duplicate"
                />
                <IconButton
                    icon={<TrashLinear className="w-5 h-5" />}
                    disabled={!isDeletable(type.id)}
                    onClick={() => {
                        removeType(type.id);
                        navigate("/types");
                    }}
                    color="red"
                    label="Delete"
                />
            </div>
            <Divider />
            <div className="p-2 flex flex-col gap-2">
                <TextInput
                    label="Type Name"
                    value={type.name || ""}
                    onChange={(value) => updateType(waypointTypeId, { name: value })}
                />
                <Select
                    label="Icon Shape"
                    value={type.icon}
                    onChange={(value) => updateType(type.id, { icon: value })}
                    options={[
                        { children: "Circle", value: "circle" },
                        { children: "Square", value: "square" },
                        { children: "Triangle", value: "triangle" },
                        { children: "Star", value: "star" },
                        { children: "Cross", value: "cross" },
                        { children: "Diamond", value: "diamond" },
                        { children: "Apple", value: "apple" },
                        { children: "Cherry", value: "cherry" },
                        { children: "Tree Stump", value: "treestump" },
                        { children: "Camera", value: "camera" },
                    ]}
                />
                <NumberInput
                    value={type.radiusOverride}
                    label="Radius (override)"
                    allowNull
                    min={-1}
                    max={100}
                    onChange={(value) =>
                        updateType(type.id, {
                            radiusOverride: value,
                        })
                    }
                    placeholder="Radius"
                    helpText="Overrides the size usually set per Waypoint"
                />
                <NumberInput
                    label="Rotation"
                    value={type.rotation}
                    allowNull
                    min={0}
                    max={360}
                    onChange={(value) =>
                        updateType(type.id, {
                            rotation: value,
                        })
                    }
                    placeholder="Rotation"
                />
                <ColorInput
                    label="Primary Color"
                    value={type.color}
                    onChange={(value) => updateType(type.id, { color: value })}
                    className="bg-black/50 p-1 rounded-md"
                />
                <ColorInput
                    label="Secondary Color"
                    value={type.color2 || "#000000"}
                    onChange={(value) => updateType(type.id, { color2: value })}
                    disabled={!type.hasTwoColors}
                />
                <Checkbox
                    label="Hidden"
                    value={type.hidden}
                    onChange={(value) => updateType(type.id, { hidden: value })}
                />
                <Checkbox
                    label="Has Two Colors"
                    value={type.hasTwoColors}
                    onChange={(value) => updateType(type.id, { hasTwoColors: value })}
                />
                <Checkbox
                    label="Has Additional Text in Label"
                    value={!!type.additionalText}
                    onChange={(value) => {
                        if (value) {
                            updateType(type.id, {
                                additionalText: {
                                    color: "#000000",
                                    fontSize: 12,
                                    fontFamily: "Arial",
                                    fontWeight: "normal",
                                },
                            });
                        } else {
                            updateType(type.id, { additionalText: undefined });
                        }
                    }}
                />
                {type.additionalText && (
                    <>
                        <ColorInput
                            label="Text Color"
                            value={type.additionalText.color || "#000000"}
                            onChange={(value) =>
                                updateType(type.id, {
                                    additionalText: {
                                        ...type.additionalText,
                                        color: value,
                                    },
                                })
                            }
                        />
                        <Select
                            label="Font Family"
                            value={type.additionalText.fontFamily || "Arial"}
                            onChange={(value) =>
                                updateType(type.id, {
                                    additionalText: {
                                        ...type.additionalText,
                                        fontFamily: value,
                                    },
                                })
                            }
                            options={[
                                { children: <span style={{ fontFamily: "Arial" }}>Arial</span>, value: "Arial" },
                                {
                                    children: <span style={{ fontFamily: "Courier New" }}>Courier New</span>,
                                    value: "Courier New",
                                },
                                { children: <span style={{ fontFamily: "Georgia" }}>Georgia</span>, value: "Georgia" },
                                {
                                    children: <span style={{ fontFamily: "Times New Roman" }}>Times New Roman</span>,
                                    value: "Times New Roman",
                                },
                                { children: <span style={{ fontFamily: "Verdana" }}>Verdana</span>, value: "Verdana" },
                            ]}
                        />
                        <NumberInput
                            label="Font Size"
                            value={type.additionalText.fontSize || 12}
                            min={1}
                            max={100}
                            onChange={(value) =>
                                updateType(type.id, {
                                    additionalText: {
                                        ...type.additionalText,
                                        fontSize: value,
                                    },
                                })
                            }
                            placeholder="Font Size"
                        />
                        <Select
                            label="Font Weight"
                            value={type.additionalText.fontWeight || "normal"}
                            onChange={(value) =>
                                updateType(type.id, {
                                    additionalText: {
                                        ...type.additionalText,
                                        fontWeight: value,
                                    },
                                })
                            }
                            options={[
                                { children: <span style={{ fontWeight: "normal" }}>Normal</span>, value: "normal" },
                                { children: <span style={{ fontWeight: "bold" }}>Bold</span>, value: "bold" },
                                { children: <span style={{ fontWeight: "bolder" }}>Bolder</span>, value: "bolder" },
                                { children: <span style={{ fontWeight: "lighter" }}>Lighter</span>, value: "lighter" },
                            ]}
                        />
                    </>
                )}
            </div>
        </Panel>
    );
}
