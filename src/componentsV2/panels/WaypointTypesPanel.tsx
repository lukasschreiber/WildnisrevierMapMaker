import { Button } from "../controls/Button";
import { Panel } from "../MainPanel";
import PlusIcon from "../../assets/icons/star.svg?react";
import DeleteIcon from "../../assets/icons/trash.svg?react";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { LegendWaypointMarker } from "../../components/legend/LegendWaypointMarker";
import { useNavigate } from "react-router";

export function WaypointTypesPanel() {
    const types = useWaypointTypeStore((state) => state.types);
    const navigate = useNavigate()
    return (
        <Panel title="Waypoint Types Panel">
            <div className="p-4 text-sm">
                <Button
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => console.log("Add new waypoint type")}
                    className="mb-4"
                    color="blue"
                >
                    Add New Type
                </Button>
                <div className="flex flex-col gap-2">
                    {Object.values(types).map((type) => (
                        <div
                            key={type.id}
                            onClick={() => navigate(`/type/${type.id}`)}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 group cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                            <LegendWaypointMarker
                                type={type}
                                radius={8}
                                borderWidth={1}
                                borderColor="black"
                            />

                            <div className="">{type.name}</div>
                            </div>
                            <DeleteIcon className="w-5 h-5 text-red-500 hover:text-red-600 hidden group-hover:block cursor-pointer" />
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}
