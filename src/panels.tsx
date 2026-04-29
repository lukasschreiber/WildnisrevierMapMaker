import ShapeIcon from "./assets/icons/shapes.svg?react";
import DrawSquareIcon from "./assets/icons/draw-square.svg?react";
import WaypointIcon from "./assets/icons/location-pin.svg?react";
import PathIcon from "./assets/icons/scribble.svg?react";
import SettingsIcon from "./assets/icons/settings.svg?react";
import GitIcon from "./assets/icons/code-branch.svg?react";
import FolderIcon from "./assets/icons/folder.svg?react";
import SlidersIcon from "./assets/icons/sliders.svg?react";
import { WaypointsPanel } from "./componentsV2/panels/WaypointsPanel";
import { PathsPanel } from "./componentsV2/panels/PathsPanel";
import { Panel } from "./componentsV2/MainPanel";
import { SVGProps } from "react";
import { GitIntegrationPanel } from "./componentsV2/panels/GitIntegrationPanel";
import { WaypointTypesPanel } from "./componentsV2/panels/WaypointTypesPanel";
import { useWaypointTypeStore } from "./stores/useWaypointTypes";
import { useWaypointStore } from "./stores/useWaypoints";
import { usePathStore } from "./stores/usePaths";
import { useWaypointGroupStore } from "./stores/useGroups";
import { useShapeStore } from "./stores/useShapes";

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
                    icon: WaypointIcon,
                    component: WaypointsPanel,
                    path: "/waypoints",
                    pinnable: true,
                    count: waypointsCount,
                },
                {
                    title: "Waypoint Types",
                    icon: ShapeIcon,
                    component: WaypointTypesPanel,
                    path: "/types",
                    pinnable: true,
                    count: waypointTypesCount,
                },
                {
                    title: "Paths",
                    icon: PathIcon,
                    component: PathsPanel,
                    path: "/paths",
                    pinnable: true,
                    count: pathsCount,
                },
                {
                    title: "Shapes",
                    icon: DrawSquareIcon,
                    component: () => <Panel title="Shapes Panel"></Panel>, // Placeholder for ShapesPanel
                    path: "/shapes",
                    pinnable: true,
                    count: shapesCount,
                },
                {
                    title: "Groups",
                    icon: FolderIcon,
                    component: () => <Panel title="Groups Panel"></Panel>, // Placeholder for ShapesPanel
                    path: "/groups",
                    pinnable: true,
                    count: groupsCount,
                },
                {
                    title: "Layout",
                    icon: SlidersIcon,
                    component: () => <Panel title="Layout Panel"></Panel>, // Placeholder for ShapesPanel
                    path: "/layout",
                    pinnable: true,
                },
            ],
        },
        {
            title: "General",
            panels: [
                {
                    title: "Git Integration",
                    icon: GitIcon,
                    component: GitIntegrationPanel,
                    path: "settings/source-control",
                    pinnable: true,
                },
                {
                    title: "Settings",
                    icon: SettingsIcon,
                    component: () => <Panel title="Settings Panel"></Panel>, // Placeholder for SettingsPanel
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
