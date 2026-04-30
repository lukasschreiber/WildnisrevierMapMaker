import { useNavigate } from "react-router";
import { LegendWaypointMarker } from "../legend/LegendWaypointMarker";
import { useWaypointStore } from "../../stores/useWaypoints";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore } from "../../stores/useGroups";
import { Panel } from "../MainPanel";
import { TextInput } from "../controls/TextInput";
import { Select } from "../controls/Select";
import { useState, useRef } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { ShapesLinear, SlidersLinear } from "@lukasschreiber/icons";
import { useInteractionsStore } from "../../stores/useInteractions";

export function WaypointsPanel() {
    const waypoints = useWaypointStore((state) => state.waypoints);
    const types = useWaypointTypeStore((state) => state.types);
    const selectedWaypointIds = useInteractionsStore((state) => state.selectedWaypointIds);
    const groups = useWaypointGroupStore((state) => state.waypointGroups);
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [groupBy, setGroupBy] = useState<"none" | "group" | "type">("none");
    const [sortBy, setSortBy] = useState<"id" | "name">("id");
    const [typeFilter, setTypeFilter] = useState<number | "all">("all");
    const filterRef = useRef<HTMLDivElement>(null);

    useClickOutside(filterRef, () => setFilterOpen(false));

    // Filter waypoints by search and type
    const filtered = waypoints.filter((wp) => {
        const search = searchValue.toLowerCase();
        const matchesSearch =
            wp.id.toString().includes(search) ||
            (wp.name && wp.name.toLowerCase().includes(search)) ||
            (wp.additionalText && wp.additionalText.toLowerCase().includes(search));
        const matchesType = typeFilter === "all" || wp.typeId === typeFilter;
        return matchesSearch && matchesType;
    });

    // Sort waypoints
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "id") return a.id - b.id;
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        return 0;
    });

    // Group waypoints
    let grouped: { [key: string]: typeof sorted } = { ungrouped: [] };

    if (groupBy === "group") {
        sorted.forEach((wp) => {
            const groupId = wp.groupId?.toString() || "ungrouped";
            if (!grouped[groupId]) grouped[groupId] = [];
            grouped[groupId].push(wp);
        });
    } else if (groupBy === "type") {
        sorted.forEach((wp) => {
            const typeId = wp.typeId.toString();
            if (!grouped[typeId]) grouped[typeId] = [];
            grouped[typeId].push(wp);
        });
    } else {
        grouped = { items: sorted };
    }

    const renderWaypoint = (waypoint: (typeof waypoints)[0]) => (
        <div
            key={waypoint.id}
            className={`flex px-2 mx-2 hover:bg-gray-100 rounded-md py-2 items-center gap-2 text-sm cursor-pointer transition-colors ${selectedWaypointIds.includes(waypoint.id) ? "bg-gray-200" : ""}`}
            onClick={() => {
                navigate(`/waypoints/${waypoint.id}`);
            }}
        >
            <LegendWaypointMarker type={types[waypoint.typeId]} radius={8} borderWidth={1} borderColor="black" />
            <span>{waypoint.id}</span>
            {waypoint.name ? ` (${waypoint.name})` : ""} {waypoint.additionalText ? `- ${waypoint.additionalText}` : ""}
        </div>
    );

    return (
        <Panel
            title={
                <div className="flex items-center justify-between w-full">
                    <span>Waypoints · {sorted.length}</span>
                    <div className="relative" ref={filterRef}>
                        <button
                            className="p-1 hover:bg-gray-100 rounded-md"
                            onClick={() => setFilterOpen(!filterOpen)}
                            aria-label="filter"
                        >
                            <SlidersLinear className="w-5 h-5 text-gray-600" />
                        </button>
                        {filterOpen && (
                            <div className="absolute right-0 top-full mt-2 font-normal bg-white border border-gray-200 rounded-md shadow-lg p-3 z-[1005] w-56">
                                <div className="flex flex-col gap-1">
                                    <Select
                                        label="Filter by Type"
                                        value={typeFilter}
                                        onChange={(v) => setTypeFilter(v)}
                                        options={[
                                            {
                                                children: (
                                                    <div className="flex items-center gap-2">
                                                        <ShapesLinear className="w-5 h-5 mr-0.5" />
                                                        All types
                                                    </div>
                                                ),
                                                value: "all",
                                            },
                                            ...Object.entries(types).map(([id, type]) => ({
                                                children: (
                                                    <div className="flex items-center gap-2">
                                                        <LegendWaypointMarker
                                                            type={type}
                                                            radius={8}
                                                            borderWidth={1}
                                                            borderColor="black"
                                                        />
                                                        <span>{type.name}</span>
                                                    </div>
                                                ),
                                                value: parseInt(id),
                                            })),
                                        ]}
                                    />

                                    <Select
                                        label="Group By"
                                        value={groupBy}
                                        onChange={setGroupBy}
                                        options={[
                                            { children: "None", value: "none" },
                                            { children: "Group", value: "group" },
                                            { children: "Type", value: "type" },
                                        ]}
                                    />

                                    <Select
                                        label="Sort By"
                                        value={sortBy}
                                        onChange={setSortBy}
                                        options={[
                                            { children: "ID", value: "id" },
                                            { children: "Name", value: "name" },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <div className="px-4 py-2">
                <TextInput placeholder="Search by name, ID, or text..." value={searchValue} onChange={setSearchValue} />
            </div>

            {groupBy === "group" ? (
                <div>
                    {Object.entries(grouped)
                        .filter(([, items]) => items.length > 0)
                        .map(([groupId, items]) => {
                            const groupObj = groups.find((g) => g.id.toString() === groupId);
                            const groupName = groupObj?.name || "Ungrouped";
                            return (
                                <div key={groupId}>
                                    <div className="text-xs text-gray-500 px-4 py-2 uppercase tracking-wide">
                                        {groupName} ({items.length})
                                    </div>
                                    {items.map(renderWaypoint)}
                                </div>
                            );
                        })}
                    {sorted.length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            No waypoints match your filters
                        </div>
                    )}
                </div>
            ) : groupBy === "type" ? (
                <div>
                    {Object.entries(grouped)
                        .filter(([, items]) => items.length > 0)
                        .map(([typeId, items]) => {
                            const typeName = types[parseInt(typeId)]?.name || "Unknown Type";
                            return (
                                <div key={typeId}>
                                    <div className="text-xs text-gray-500 px-4 py-2 uppercase tracking-wide">
                                        {typeName} ({items.length})
                                    </div>
                                    {items.map(renderWaypoint)}
                                </div>
                            );
                        })}
                    {sorted.length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            No waypoints match your filters
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {sorted.length > 0 ? (
                        sorted.map(renderWaypoint)
                    ) : (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                            No waypoints match your filters
                        </div>
                    )}
                </div>
            )}
        </Panel>
    );
}
