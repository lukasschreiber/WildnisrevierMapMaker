import { useNavigate, useParams } from "react-router";
import { Panel } from "../MainPanel";
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

export interface SinglePathPanelProps {
    pathId: number;
}

export function SinglePathPanelWrapper() {
    const params = useParams();
    if (!params.id) {
        return <div>Error: No path ID provided</div>;
    }

    return <SinglePathPanel pathId={Number(params.id)} />;
}

export function SinglePathPanel({ pathId }: SinglePathPanelProps) {
    const path = usePathStore((state) => state.paths.find((p) => p.id === pathId)!);
    const deletePath = usePathStore((state) => state.deletePath);
    const updatePath = usePathStore((state) => state.updatePath);
    const navigate = useNavigate();

    return (
        <Panel topColor="pink">
            <div className="p-4 flex items-center flex-col">
                <ScribbleLinear className="text-pink-500" size={64} />
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
                        updatePath(path.id, { hidden: !path.hidden });
                    }}
                    label={path.hidden ? "Show" : "Hide"}
                />
                <IconButton icon={<CloneLinear className="w-5 h-5" />} onClick={() => {}} label="Duplicate" />
                <IconButton
                    icon={<TrashLinear className="w-5 h-5" />}
                    onClick={() => {
                        deletePath(path.id);
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
                    onChange={(value) => updatePath(pathId, { name: value })}
                />
                <Select
                    label="Path Style"
                    value={path.style}
                    onChange={(value) => updatePath(path.id, { style: value })}
                    options={[
                        { label: "Solid", value: "solid" },
                        { label: "Dashed", value: "dashed" },
                        { label: "Dotted", value: "dotted" },
                    ]}
                    placeholder="Style"
                />
                {path.style === "dashed" && (
                    <TextInput
                        label="Dasharray"
                        value={path.dasharray}
                        onChange={(value) => updatePath(path.id, { dasharray: value })}
                        placeholder="Dasharray"
                        helpText="A SVG Dasharray for example ..."
                    />
                )}
                <NumberInput
                    label="Path Tension"
                    value={path.tension}
                    onChange={(value) => updatePath(path.id, { tension: value })}
                    placeholder="Tension"
                    min={0}
                    max={1}
                    step={0.01}
                    helpText="Tension defines how strictly the path sticks to the control polygon"
                />
                <NumberInput
                    label="Path Thickness"
                    value={path.width}
                    onChange={(value) => updatePath(path.id, { width: value })}
                    placeholder="Width"
                    min={0}
                />
                <ColorInput
                    label="Path Color"
                    value={path.color}
                    onChange={(value) => updatePath(path.id, { color: value })}
                    placeholder="Color"
                />
                <NumberInput
                    label="Outline Thickness"
                    value={path.outlineWidth}
                    onChange={(value) => updatePath(path.id, { outlineWidth: value })}
                    placeholder="Outline Width"
                    min={0}
                />
                <ColorInput
                    label="Outline Color"
                    value={path.outlineColor}
                    onChange={(value) => updatePath(path.id, { outlineColor: value })}
                    placeholder="Outline Color"
                />
                <Select
                    label="Line Cap"
                    value={path.linecap}
                    onChange={(value) => updatePath(path.id, { linecap: value })}
                    options={[
                        { label: "Round", value: "round" },
                        { label: "Butt", value: "butt" },
                        { label: "Square", value: "square" },
                    ]}
                    placeholder="Linecap"
                />
                <NumberInput
                    label="Opacity"
                    value={path.opacity}
                    onChange={(value) => updatePath(path.id, { opacity: value })}
                    placeholder="Opacity"
                    min={0}
                    max={1}
                    step={0.01}
                />
                <Checkbox
                    onChange={(value) => updatePath(path.id, { hidden: value })}
                    label="Hidden"
                    value={path.hidden ?? false}
                />
            </div>
        </Panel>
    );
}
