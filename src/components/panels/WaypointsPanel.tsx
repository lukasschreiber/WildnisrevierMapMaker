import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import useLocalStorage from "../../hooks/useLocalStorage";
import { renderMarker } from "../../renderer/renderMarkers";
import { Select } from "../inputs/Select";
import { useWaypointTypeStore } from "../../stores/useWaypointTypes";
import { useWaypointGroupStore } from "../../stores/useGroups";
import { useWaypointStore, Waypoint } from "../../stores/useWaypoints";
import { useSettingsStore } from "../../stores/useSettings";
import { useMap } from "../../context/MapContext";

type GroupByOption = "type" | "group";
type SortByOption = "id" | "name" | "type" | "group";
type SortDirection = "asc" | "desc";

export function WaypointsPanel() {
    const waypoints = useWaypointStore((state) => state.waypoints);
    const selectedId = useWaypointStore((state) => state.selectedId);
    const selectWaypoint = useWaypointStore((state) => state.selectWaypoint);
    const deselectWaypoint = useWaypointStore((state) => state.deselectWaypoint);
    const getTypeById = useWaypointTypeStore((state) => state.getTypeById);
    const getWaypointGroupById = useWaypointGroupStore((state) => state.getWaypointGroupById);
    const map = useMap();

    // NEW: state for grouping and sorting
    const [groupBy, setGroupBy] = useLocalStorage<GroupByOption>("waypoints-group-by", "type");
    const [sortBy, setSortBy] = useLocalStorage<SortByOption>("waypoints-sort-by", "id");
    const [sortDirection, setSortDirection] = useLocalStorage<SortDirection>("waypoints-sort-direction", "asc");

    const handleWaypointClick = (id: number) => {
        if (selectedId === id) {
            deselectWaypoint();
        } else {
            selectWaypoint(id);
            const waypoint = waypoints.find((wp) => wp.id === id);
            if (waypoint) {
                map.flyTo([waypoint.lat, waypoint.lng], map.getZoom());
            }
        }
    };

    const sortedWaypoints = useMemo(() => {
        const sorted = [...waypoints];
        sorted.sort((a, b) => {
            let aValue: string | number = a.id;
            let bValue: string | number = b.id;

            if (sortBy === "name") {
                aValue = a.name ?? "";
                bValue = b.name ?? "";
            } else if (sortBy === "type") {
                aValue = a.typeId;
                bValue = b.typeId;
            } else if (sortBy === "group") {
                aValue = a.groupId ?? -1;
                bValue = b.groupId ?? -1;
            }

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [waypoints, sortBy, sortDirection]); // NEW

    const groupedWaypoints = useMemo(() => {
        const groups: Record<string, Waypoint[]> = {};

        sortedWaypoints.forEach((waypoint) => {
            let key = "";

            if (groupBy === "type") {
                key = waypoint.typeId.toString();
            } else if (groupBy === "group" && waypoint.groupId) {
                key = waypoint.groupId.toString();
            }

            if (!key) {
                return; // Skip if no group key
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(waypoint);
        });

        return groups;
    }, [sortedWaypoints, groupBy]);

    const waypointsInNeedOfClassification = useMemo(() => {
        return waypoints.filter((wp) => wp.name?.includes("?"));
    }, [waypoints]);

    return (
        <div className="waypoint-list-container">
            <div className="waypoint-list-header font-bold text-sm mb-2">Waypoints - {waypoints.length}</div>
            <div className="flex flex-row gap-4 mb-4">
                <div>
                    <label className="block text-xs mb-1">Group By</label>
                    <Select
                        value={groupBy}
                        onChange={(value) => setGroupBy(value as GroupByOption)}
                        options={[
                            { label: "Type", value: "type" },
                            { label: "Group", value: "group" },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">Sort By</label>
                    <Select
                        value={sortBy}
                        onChange={(value) => setSortBy(value as SortByOption)}
                        options={[
                            { label: "ID", value: "id" },
                            { label: "Name", value: "name" },
                            { label: "Type", value: "type" },
                            { label: "Group", value: "group" },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">Direction</label>
                    <Select
                        value={sortDirection}
                        options={[
                            { label: "Ascending", value: "asc" },
                            { label: "Descending", value: "desc" },
                        ]}
                        onChange={(value) => setSortDirection(value as SortDirection)}
                    />
                </div>
            </div>
            {waypointsInNeedOfClassification.length > 0 && (
                <a className="!text-white underline mb-2 block" href="#winoc">
                    Jump to Waypoints in need of classification - {waypointsInNeedOfClassification.length}
                </a>
            )}

            {/* Grouped Waypoints */}
            {Object.entries(groupedWaypoints).map(([groupKey, groupWaypoints]) => {
                let title = "";

                if (groupBy === "type") {
                    const waypointType = getTypeById(Number(groupKey));
                    title = waypointType?.name ?? `Unknown Type (${groupKey})`;
                } else if (groupBy === "group") {
                    const waypointGroup = getWaypointGroupById(Number(groupKey));
                    title = waypointGroup?.name ?? `Group ${groupKey}`;
                } else if (groupBy === "name") {
                    title = `Name starts with "${groupKey}"`;
                }

                return (
                    <div key={groupKey} className="waypoint-group">
                        <div className="waypoint-group-header font-bold mb-1">
                            {title} - {groupWaypoints.length}
                        </div>
                        {groupWaypoints.map((waypoint) => (
                            <WaypointListItem
                                key={waypoint.id}
                                waypoint={waypoint}
                                selectedId={selectedId}
                                onClick={handleWaypointClick}
                            />
                        ))}
                    </div>
                );
            })}

            {waypointsInNeedOfClassification.length > 0 && (
                <>
                    <div className="waypoint-list-header font-bold text-sm mb-2" id="winoc">
                        Waypoints in need of classification - {waypointsInNeedOfClassification.length}
                    </div>
                    {waypointsInNeedOfClassification.map((waypoint) => (
                        <WaypointListItem
                            key={waypoint.id}
                            waypoint={waypoint}
                            selectedId={selectedId}
                            onClick={handleWaypointClick}
                        />
                    ))}
                </>
            )}
        </div>
    );
}

function WaypointListItem({
    waypoint,
    selectedId,
    onClick,
}: {
    waypoint: Waypoint;
    selectedId: number | null;
    onClick: (id: number) => void;
}) {
    const getTypeById = useWaypointTypeStore((state) => state.getTypeById);
    const waypointType = getTypeById(waypoint.typeId);
    const getWaypointGroupById = useWaypointGroupStore((state) => state.getWaypointGroupById);
    const waypointGroup = getWaypointGroupById(waypoint.groupId ?? -1);
    const containerRef = useRef<SVGSVGElement>(null);
    const waypointBorderColor = useSettingsStore((state) => state.settings.waypointBorderColor);
    const waypointBorderWidth = useSettingsStore((state) => state.settings.waypointBorderWidth);
    const showWaypointBorder = useSettingsStore((state) => state.settings.showWaypointBorder);

    useEffect(() => {
        if (containerRef.current && waypointType) {
            d3.select(containerRef.current).selectAll("*").remove(); // Clear previous icons
            const g = d3.select(containerRef.current).append("g").attr("class", "waypoint-icon");
            renderMarker(
                g,
                { x: 11, y: 11 },
                undefined,
                false,
                10,
                waypointType,
                waypointGroup,
                waypointBorderWidth,
                waypointBorderColor,
                showWaypointBorder,
                true
            );
        }
    }, [containerRef, waypointType, waypointGroup, waypointBorderWidth, waypointBorderColor, showWaypointBorder]);

    return (
        <div
            className={`flex flex-row gap-2 rounded-md p-1 cursor-pointer items-center ${selectedId === waypoint.id ? "bg-blue-500 text-white" : "hover:bg-blue-400"}`}
            onClick={() => onClick(waypoint.id)}
        >
            {waypointType && <svg ref={containerRef} width={22} height={22}></svg>}
            <div>
                {waypoint.id}
                {waypoint.name ? ` - ${waypoint.name}` : ""}
            </div>
        </div>
    );
}
