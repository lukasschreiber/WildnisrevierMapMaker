import { Panel } from "../components/Panel";
import { SingleWaypointPanel } from "../components/panels/SingleWaypointPanel";
import { WaypointsPanel } from "../components/panels/WaypointsPanel";
import { useUrlState } from "../hooks/useUrlState";

export function WaypointsPanelRoute() {
    const { active, selection } = useUrlState();

    const selectedWaypointIds = selection.waypoint ?? [];

    if (selectedWaypointIds.length > 1) {
        return <Panel title={`${selectedWaypointIds.length} Waypoints Selected`} />;
    }

    if (active?.type === "waypoint") {
        return <SingleWaypointPanel id={active.id} />;
    }

    return <WaypointsPanel />;
}
