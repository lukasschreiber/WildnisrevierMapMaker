import { useEffect, useMemo, useRef } from "react";
import { useWaypointContext, Waypoint } from "../context/WaypointContext";
import { useWaypointTypeContext } from "../context/WaypointTypeContext";
import { renderMarker } from "../renderer/renderMarkers";
import { useSettings } from "../settings/useSettings";
import * as d3 from "d3";

export function WaypointListContainer() {
    const { waypoints, selectedId, selectWaypoint, deselectWaypoint } = useWaypointContext();
    const { getWaypointTypeById } = useWaypointTypeContext();

    const handleWaypointClick = (id: number) => {
        if (selectedId === id) {
            deselectWaypoint();
        } else {
            selectWaypoint(id);
        }
    };

    const groupedWaypoints = useMemo(
        () =>
            waypoints
                .sort((a, b) => a.id - b.id)
                .reduce(
                    (groups, waypoint) => {
                        if (!groups[waypoint.typeId]) {
                            groups[waypoint.typeId] = [];
                        }
                        groups[waypoint.typeId].push(waypoint);
                        return groups;
                    },
                    {} as Record<number, typeof waypoints>
                ),
        [waypoints]
    );

    return (
        <div className="waypoint-list-container">
            <div className="waypoint-list-header font-bold text-sm mb-2">Waypoints - {waypoints.length}</div>
            {Object.entries(groupedWaypoints).map(([typeId, waypoints]) => {
                const waypointType = getWaypointTypeById(Number(typeId));
                return (
                    <div key={typeId} className="waypoint-group">
                        <div className="waypoint-group-header font-bold">{waypointType?.name || `Unknown Type (${typeId})`} - {waypoints.length}</div>
                        {waypoints.map((waypoint) => (
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
    const containerRef = useRef<SVGSVGElement>(null);
    const { settings } = useSettings();

    useEffect(() => {
        if (containerRef.current && waypointType) {
            const g = d3.select(containerRef.current).append("g").attr("class", "waypoint-icon");
            renderMarker(
                g,
                { x: 11, y: 11 },
                false,
                10,
                waypointType,
                settings.waypointBorderWidth,
                settings.waypointBorderColor,
                settings.showWaypointBorder
            );
        }
    }, [containerRef, waypointType]);

    return (
        <div
            className={`flex flex-row gap-2 rounded-md p-1 cursor-pointer items-center ${selectedId === waypoint.id ? "bg-blue-500" : ""}`}
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
