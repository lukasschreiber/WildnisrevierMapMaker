import { WaypointsPanel } from "./components/panels/WaypointsPanel";
import { Panel } from "./components/MainPanel";
import { SVGProps } from "react";
import { GitIntegrationPanel } from "./components/panels/GitIntegrationPanel";
import { WaypointTypesPanel } from "./components/panels/WaypointTypesPanel";
import { useWaypointTypeStore } from "./stores/useWaypointTypes";
import { useWaypointStore } from "./stores/useWaypoints";
import { usePathStore } from "./stores/usePaths";
import { useWaypointGroupStore } from "./stores/useGroups";
import { useShapeStore } from "./stores/useShapes";
import { PathsPanel } from "./components/panels/PathsPanel";
import { CodeBranchLinear, DrawSquareLinear, FolderLinear, LocationPinLinear, RefreshCcwClockLinear, ScribbleLinear, ShapesLinear, SlidersLinear } from "@lukasschreiber/icons";
import { HistoryPanel } from "./components/panels/HistoryPanel";
import { SettingsPanel } from "./components/panels/SettingsPanel";

export function usePanels(): PanelGroupConfig[] {
    const waypointTypesCount = useWaypointTypeStore((state) => Object.values(state.types).length);
    const waypointsCount = useWaypointStore((state) => state.waypoints.length);
    const pathsCount = usePathStore((state) => state.paths.length);
    const groupsCount = useWaypointGroupStore((state) => state.waypointGroups.length);
    const shapesCount = useShapeStore((state) => state.shapes.length);

    return [
        {
            title: "Current Map",
            panels: [
                {
                    title: "Waypoints",
                    icon: LocationPinLinear,
                    component: WaypointsPanel,
                    path: "/waypoints",
                    pinnable: true,
                    count: waypointsCount,
                },
                {
                    title: "Waypoint Types",
                    icon: ShapesLinear,
                    component: WaypointTypesPanel,
                    path: "/types",
                    pinnable: true,
                    count: waypointTypesCount,
                },
                {
                    title: "Paths",
                    icon: ScribbleLinear,
                    component: PathsPanel,
                    path: "/paths",
                    pinnable: true,
                    count: pathsCount,
                },
                {
                    title: "Shapes",
                    icon: DrawSquareLinear,
                    component: () => <Panel title="Shapes Panel"></Panel>, // Placeholder for ShapesPanel
                    path: "/shapes",
                    pinnable: true,
                    count: shapesCount,
                },
                {
                    title: "Groups",
                    icon: FolderLinear,
                    component: () => <Panel title="Groups Panel"></Panel>, // Placeholder for ShapesPanel
                    path: "/groups",
                    pinnable: true,
                    count: groupsCount,
                },
                {
                    title: "Layout",
                    icon: SlidersLinear,
                    component: () => <Panel title="Layout Panel"></Panel>, // Placeholder for ShapesPanel
                    path: "/layout",
                    pinnable: true,
                },
                {
                    title: "History",
                    icon: RefreshCcwClockLinear,
                    component: HistoryPanel,
                    path: "/history",
                    pinnable: true,
                }
            ],
        },
        {
            title: "General",
            panels: [
                {
                    title: "Git Integration",
                    icon: CodeBranchLinear,
                    component: GitIntegrationPanel,
                    path: "settings/source-control",
                    pinnable: true,
                },
                {
                    title: "Settings",
                    icon: SlidersLinear, // Cog
                    component: SettingsPanel,
                    path: "settings",
                    pinnable: true,
                },
            ],
        },
    ];
}

interface PanelConfig {
    title: string;
    icon: React.ComponentType<SVGProps<SVGSVGElement>>;
    component: React.ComponentType;
    path: string;
    pinnable?: boolean;
    count?: number;
}

interface PanelGroupConfig {
    title: string;
    panels: PanelConfig[];
}
