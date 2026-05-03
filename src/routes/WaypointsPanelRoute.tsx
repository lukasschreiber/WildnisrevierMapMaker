import { SingleWaypointPanel } from "../components/panels/SingleWaypointPanel";
import { WaypointsPanel } from "../components/panels/WaypointsPanel";
import { useUrlState } from "../hooks/useUrlState";

export function WaypointsPanelRoute() {
    const { active } = useUrlState();

    if (active?.type === "waypoint") {
        return <SingleWaypointPanel id={active.id} />;
    }

    return <WaypointsPanel />;
}
