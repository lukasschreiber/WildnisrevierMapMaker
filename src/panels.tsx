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

export const panels: PanelGroupConfig[] = [
    {
        title: "Current Map",
        panels: [
            {
                title: "Waypoints",
                icon: WaypointIcon,
                component: WaypointsPanel,
                path: "/waypoints",
                pinnable: true,
            },
            {
                title: "Waypoint Types",
                icon: ShapeIcon,
                component: WaypointTypesPanel,
                path: "/types",
                pinnable: true,
            },
            {
                title: "Paths",
                icon: PathIcon,
                component: PathsPanel,
                path: "/paths",
                pinnable: true,
            },
            {
                title: "Shapes",
                icon: DrawSquareIcon,
                component: () => <Panel title="Shapes Panel"></Panel>, // Placeholder for ShapesPanel
                path: "/shapes",
                pinnable: true,
            },
            {
                title: "Groups",
                icon: FolderIcon,
                component: () => <Panel title="Groups Panel"></Panel>, // Placeholder for ShapesPanel
                path: "/groups",
                pinnable: true,
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

interface PanelConfig {
    title: string;
    icon: React.ComponentType<SVGProps<SVGSVGElement>>;
    component: React.ComponentType;
    path: string;
    pinnable?: boolean;
}

interface PanelGroupConfig {
    title: string;
    panels: PanelConfig[];
}
