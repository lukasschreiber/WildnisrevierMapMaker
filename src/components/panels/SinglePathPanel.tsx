import { useNavigate } from "react-router";
import { Panel } from "../Panel";
import {
    CloneLinear,
    EyeLinear,
    EyeSlashLinear,
    PenLineSolid,
    ScribbleLinear,
    TrashLinear,
} from "@lukasschreiber/icons";
import { usePathStore } from "../../stores/usePaths";
import { Divider } from "../common/Divider";
import { IconButton } from "../controls/IconButton";
import { TextInput } from "../controls/TextInput";
import { Select } from "../controls/Select";
import { NumberInput } from "../controls/NumberInput";
import { ColorInput } from "../controls/ColorInput";
import { Checkbox } from "../controls/Checkbox";
import { pathActions } from "../../domain/actions/paths";

export interface SinglePathPanelProps {
    id: number;
}

function LineCapPreview({ cap }: { cap: "round" | "butt" | "square" }) {
    return (
        <svg width="28" height="12" viewBox="0 0 28 12" className="shrink-0">
            <line x1="4" y1="6" x2="24" y2="6" stroke="black" strokeWidth="12" strokeLinecap={cap} />
        </svg>
    );
}

export function SinglePathPanel({ id }: SinglePathPanelProps) {
    const path = usePathStore((state) => state.paths.find((p) => p.id === id)!);
    const navigate = useNavigate();

    return (
        <Panel topComponent={<div className="h-full w-full opacity-30" style={{ background: path.color }} />}>
            <div className="p-4 flex items-center flex-col">
                <ScribbleLinear
                    style={{
                        color: path.color,
                        filter: `drop-shadow(1px 1px ${path.outlineColor}) drop-shadow(1px -1px ${path.outlineColor}) drop-shadow(-1px 1px ${path.outlineColor}) drop-shadow(-1px -1px ${path.outlineColor})`,
                    }}
                    size={64}
                />
                <div className="text-lg text-gray-800 font-medium flex items-center gap-2 mt-2">
                    {path.name}
                    <PenLineSolid className="text-blue-500" size={18} />
                </div>
                <div className="text-sm text-gray-500 italic">
                    Path consists of {path.segments.length} segment{path.segments.length !== 1 && "s"}
                </div>
            </div>
            <Divider />
            <div className="px-4 py-2 flex gap-2 items-center justify-center">
                <IconButton
                    icon={path.hidden ? <EyeLinear className="w-5 h-5" /> : <EyeSlashLinear className="w-5 h-5" />}
                    onClick={() => {
                        pathActions.updatePath(path.id, { hidden: !path.hidden });
                    }}
                    label={path.hidden ? "Show" : "Hide"}
                />
                <IconButton icon={<CloneLinear className="w-5 h-5" />} onClick={() => {}} label="Duplicate" />
                <IconButton
                    icon={<TrashLinear className="w-5 h-5" />}
                    onClick={() => {
                        pathActions.deletePath(path.id);
                        navigate("/paths");
                    }}
                    color="red"
                    label="Delete"
                />
            </div>
            <Divider />
            <div className="p-2 flex flex-col gap-2">
                <TextInput
                    label="Path Name"
                    value={path.name || ""}
                    onChange={(value) => pathActions.updatePath(id, { name: value })}
                />
                <Select
                    label="Path Style"
                    value={path.style || "solid"}
                    onChange={(value) => pathActions.updatePath(path.id, { style: value })}
                    options={[
                        {
                            value: "solid",
                            children: (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-0 border-t-2 border-black"
                                        style={{ borderStyle: "solid" }}
                                    />
                                    Solid
                                </div>
                            ),
                        },
                        {
                            value: "dashed",
                            children: (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-0 border-t-2 border-black"
                                        style={{ borderStyle: "dashed" }}
                                    />
                                    Dashed
                                </div>
                            ),
                        },
                        {
                            value: "dotted",
                            children: (
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-0 border-t-2 border-black"
                                        style={{ borderStyle: "dotted" }}
                                    />
                                    Dotted
                                </div>
                            ),
                        },
                    ]}
                    placeholder="Style"
                />
                {path.style === "dashed" && (
                    <TextInput
                        label="Dasharray"
                        value={path.dasharray}
                        onChange={(value) => pathActions.updatePath(path.id, { dasharray: value })}
                        placeholder="Dasharray"
                        helpText="A SVG Dasharray for example ..."
                    />
                )}
                <NumberInput
                    label="Path Tension"
                    value={path.tension}
                    onChange={(value) => pathActions.updatePath(path.id, { tension: value })}
                    placeholder="Tension"
                    min={0}
                    max={1}
                    step={0.01}
                    helpText="Tension defines how strictly the path sticks to the control polygon"
                />
                <NumberInput
                    label="Path Thickness"
                    value={path.width}
                    onChange={(value) => pathActions.updatePath(path.id, { width: value })}
                    placeholder="Width"
                    min={0}
                />
                <ColorInput
                    label="Path Color"
                    value={path.color}
                    onChange={(value) => pathActions.updatePath(path.id, { color: value })}
                    placeholder="Color"
                />
                <NumberInput
                    label="Outline Thickness"
                    value={path.outlineWidth}
                    onChange={(value) => pathActions.updatePath(path.id, { outlineWidth: value })}
                    placeholder="Outline Width"
                    min={0}
                />
                <ColorInput
                    label="Outline Color"
                    value={path.outlineColor}
                    onChange={(value) => pathActions.updatePath(path.id, { outlineColor: value })}
                    placeholder="Outline Color"
                />
                <Select
                    label="Line Cap"
                    value={path.linecap ?? "round"}
                    onChange={(value) => pathActions.updatePath(path.id, { linecap: value })}
                    options={[
                        {
                            value: "round",
                            children: (
                                <div className="flex items-center gap-2">
                                    <LineCapPreview cap="round" />
                                    Round
                                </div>
                            ),
                        },
                        {
                            value: "butt",
                            children: (
                                <div className="flex items-center gap-2">
                                    <LineCapPreview cap="butt" />
                                    Butt
                                </div>
                            ),
                        },
                        {
                            value: "square",
                            children: (
                                <div className="flex items-center gap-2">
                                    <LineCapPreview cap="square" />
                                    Square
                                </div>
                            ),
                        },
                    ]}
                    placeholder="Linecap"
                />
                <NumberInput
                    label="Opacity"
                    value={path.opacity}
                    onChange={(value) => pathActions.updatePath(path.id, { opacity: value })}
                    placeholder="Opacity"
                    allowNull
                    min={0}
                    max={1}
                    step={0.01}
                />
                <Checkbox
                    onChange={(value) => pathActions.updatePath(path.id, { hidden: value })}
                    label="Hidden"
                    value={path.hidden ?? false}
                />
            </div>
        </Panel>
    );
}
