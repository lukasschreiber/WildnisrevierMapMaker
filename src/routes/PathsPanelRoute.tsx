import { Panel } from "../components/Panel";
import { PathsPanel } from "../components/panels/PathsPanel";
import { SinglePathPanel } from "../components/panels/SinglePathPanel";
import { useUrlState } from "../hooks/useUrlState";

export function PathsPanelRoute() {
    const { active, selection } = useUrlState();

    const selectedPathIds = selection.path ?? [];

    if (selectedPathIds.length > 1) {
        return <Panel title={`${selectedPathIds.length} Paths Selected`} />;
    }

    if (active?.type === "path") {
        return <SinglePathPanel id={active.id} />;
    }

    return <PathsPanel />;
}