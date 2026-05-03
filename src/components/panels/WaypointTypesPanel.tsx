import { Button } from "../controls/Button";
import { Panel } from "../Panel";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { LegendWaypointMarker } from "../legend/LegendWaypointMarker";
import { PlusLinear, TrashLinear } from "@lukasschreiber/icons";
import { useUrlState } from "../../hooks/useUrlState";

export function WaypointTypesPanel() {
    const types = useWaypointTypeStore((state) => state.types);
    const addType = useWaypointTypeStore((state) => state.addType);
    const removeType = useWaypointTypeStore((state) => state.removeType);
    const isDeletable = useWaypointTypeStore((state) => state.isDeletable);
    const { setActive } = useUrlState();
    return (
        <Panel
            title={
                <div className="flex justify-between gap-1">
                    <div>Waypoint Types · {Object.values(types).length}</div>
                    <Button
                        icon={<PlusLinear className="w-4 h-4" />}
                        onClick={() => {
                            const id = Date.now();
                            addType({
                                id,
                                name: "New Type",
                                icon: "circle",
                                color: "#000000",
                                hidden: false,
                                hasTwoColors: false,
                            });
                            setActive({
                                type: "waypoint-type",
                                id,
                            });
                        }}
                        className="mb-2 text-xs font-normal"
                        color="blue"
                    >
                        New
                    </Button>
                </div>
            }
        >
            <div className="px-4 py-2 text-sm">
                <div className="flex flex-col">
                    {Object.values(types).map((type) => (
                        <div
                            key={type.id}
                            onClick={() => {
                                setActive({
                                    type: "waypoint-type",
                                    id: type.id,
                                });
                            }}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 group cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <LegendWaypointMarker type={type} radius={8} borderWidth={1} borderColor="black" />

                                <div className="">{type.name}</div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    removeType(type.id);
                                }}
                                disabled={!isDeletable(type.id)}
                                className="disabled:opacity-50 hover:text-red-600 disabled:hover:text-red-500 hidden group-hover:block cursor-pointer"
                            >
                                <TrashLinear className="w-5 h-5 text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}
