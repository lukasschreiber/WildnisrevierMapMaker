import { useEffect, useMemo, useRef } from "react";
import { useWaypointContext, Waypoint } from "../context/WaypointContext";
import { useWaypointTypeContext } from "../context/WaypointTypeContext";
import { renderMarker } from "../renderer/renderMarkers";
import { useSettings } from "../settings/useSettings";
import * as d3 from "d3";
import { useMap } from "react-leaflet";
import { useWaypointGroupContext } from "../context/WaypointGroupContext";
import useLocalStorage from "../hooks/useLocalStorage";

type GroupByOption = "type" | "group";
type SortByOption = "id" | "name" | "type" | "group";
type SortDirection = "asc" | "desc";

export function WaypointListContainer() {
    const { waypoints, selectedId, selectWaypoint, deselectWaypoint } = useWaypointContext();
    const { getWaypointTypeById } = useWaypointTypeContext();
    const { getWaypointGroupById } = useWaypointGroupContext();
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
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                        className="w-full bg-black/50 p-1 rounded-md"
                    >
                        <option value="type">Type</option>
                        <option value="group">Group</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortByOption)}
                        className="w-full bg-black/50 p-1 rounded-md"
                    >
                        <option value="id">ID</option>
                        <option value="name">Name</option>
                        <option value="type">Type</option>
                        <option value="group">Group</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs mb-1">Direction</label>
                    <select
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                        className="w-full bg-black/50 p-1 rounded-md"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
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
                    const waypointType = getWaypointTypeById(Number(groupKey));
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
    const waypointType = useWaypointTypeContext().getWaypointTypeById(waypoint.typeId);
    const waypointGroup = useWaypointGroupContext().getWaypointGroupById(waypoint.groupId ?? -1);
    const containerRef = useRef<SVGSVGElement>(null);
    const { settings } = useSettings();

    useEffect(() => {
        if (containerRef.current && waypointType) {
            d3.select(containerRef.current).selectAll("*").remove(); // Clear previous icons
            const g = d3.select(containerRef.current).append("g").attr("class", "waypoint-icon");
            renderMarker(
                g,
                { x: 11, y: 11 },
                false,
                10,
                waypointType,
                waypointGroup,
                settings.waypointBorderWidth,
                settings.waypointBorderColor,
                settings.showWaypointBorder
            );
        }
    }, [containerRef, waypointType, waypointGroup, settings]); // Updated dependencies

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
