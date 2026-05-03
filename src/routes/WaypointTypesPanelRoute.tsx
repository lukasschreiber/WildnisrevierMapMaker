import { SingleWaypointTypePanel } from "../components/panels/SingleWaypointTypePanel";
import { WaypointTypesPanel } from "../components/panels/WaypointTypesPanel";
import { useUrlState } from "../hooks/useUrlState";

export function WaypointTypesPanelRoute() {
    const { active } = useUrlState();

    if (active?.type === "waypoint-type") {
        return <SingleWaypointTypePanel id={active.id} />;
    }

    return <WaypointTypesPanel />;
}