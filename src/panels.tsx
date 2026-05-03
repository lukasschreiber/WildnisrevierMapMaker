import { Panel } from "./components/Panel";
import { SVGProps } from "react";
import { GitIntegrationPanel } from "./components/panels/GitIntegrationPanel";
import { useWaypointTypeStore } from "./stores/useWaypointTypes";
import { useWaypointStore } from "./stores/useWaypoints";
import { usePathStore } from "./stores/usePaths";
import { useWaypointGroupStore } from "./stores/useGroups";
import { useShapeStore } from "./stores/useShapes";
import {
    CodeBranchLinear,
    DrawSquareLinear,
    FolderLinear,
    LocationPinLinear,
    RefreshCcwClockLinear,
    ScribbleLinear,
    ShapesLinear,
    SlidersLinear,
} from "@lukasschreiber/icons";
import { HistoryPanel } from "./components/panels/HistoryPanel";
import { SettingsPanel } from "./components/panels/SettingsPanel";
import { WaypointsPanelRoute } from "./routes/WaypointsPanelRoute";
import { WaypointTypesPanelRoute } from "./routes/WaypointTypesPanelRoute";
import { PathsPanelRoute } from "./routes/PathsPanelRoute";

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
                    component: WaypointsPanelRoute,
                    path: "waypoints",
                    entityType: "waypoint",
                    mapSelectable: true,
                    pinnable: true,
                    count: waypointsCount,
                },
                {
                    title: "Waypoint Types",
                    icon: ShapesLinear,
                    component: WaypointTypesPanelRoute,
                    path: "types",
                    entityType: "waypoint-type",
                    mapSelectable: false,
                    pinnable: true,
                    count: waypointTypesCount,
                },
                {
                    title: "Paths",
                    icon: ScribbleLinear,
                    component: PathsPanelRoute,
                    path: "paths",
                    entityType: "path",
                    mapSelectable: true,
                    pinnable: true,
                    count: pathsCount,
                },
                {
                    title: "Shapes",
                    icon: DrawSquareLinear,
                    component: () => <Panel title="Shapes Panel" />,
                    path: "shapes",
                    entityType: "shape",
                    mapSelectable: true,
                    pinnable: true,
                    count: shapesCount,
                },
                {
                    title: "Groups",
                    icon: FolderLinear,
                    component: () => <Panel title="Groups Panel" />,
                    path: "groups",
                    entityType: "group",
                    mapSelectable: false,
                    pinnable: true,
                    count: groupsCount,
                },
                {
                    title: "Layout",
                    icon: SlidersLinear,
                    component: () => <Panel title="Layout Panel" />,
                    path: "layout",
                    pinnable: true,
                },
                {
                    title: "History",
                    icon: RefreshCcwClockLinear,
                    component: HistoryPanel,
                    path: "history",
                    pinnable: true,
                },
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
                    icon: SlidersLinear,
                    component: SettingsPanel,
                    path: "settings",
                    pinnable: true,
                },
            ],
        },
    ];
}

export type PanelEntityType =
    | "waypoint"
    | "waypoint-type"
    | "path"
    | "shape"
    | "group";

interface PanelConfig {
    title: string;
    icon: React.ComponentType<SVGProps<SVGSVGElement>>;
    component: React.ComponentType;
    path: string;
    entityType?: PanelEntityType;
    mapSelectable?: boolean;
    pinnable?: boolean;
    count?: number;
}

interface PanelGroupConfig {
    title: string;
    panels: PanelConfig[];
}