import * as d3 from "d3";
import L from "leaflet";
import { WaypointGroup } from "../stores/useGroups";
import { Path } from "../stores/usePaths";
import { Shape } from "../stores/useShapes";
import { Waypoint } from "../stores/useWaypoints";
import { WaypointType } from "../stores/useWaypointTypes";

export type RenderGroupSelection = d3.Selection<SVGGElement, unknown, null, undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyD3Selection = d3.Selection<any, unknown, null, undefined>;
export type RenderPoint = { x: number; y: number };

export interface RenderMarkerOptions {
    g: RenderGroupSelection;
    point: RenderPoint;
    additionalText?: string;
    hidden: boolean;
    radius: number;
    type: WaypointType;
    group?: WaypointGroup;
    borderWidth: number;
    borderColor: string;
    showBorder: boolean;
    visualizeHiddenItems: boolean;
}

export interface RenderLabelOptions {
    g: RenderGroupSelection;
    x: number;
    y: number;
    text: string;
    hiddenOnExportKind?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    opacity?: number;
}

export interface RenderWaypointArrowOptions {
    g: RenderGroupSelection;
    a: L.Point;
    b: L.Point;
    offset: number;
    color: string;
    size: number;
    width: number;
    opacity: number;
}

export interface RenderPathOptions {
    g: RenderGroupSelection;
    map: L.Map;
    path: Path;
    points: RenderPoint[];
    hideOriginalPaths: boolean;
    hideFancyPaths: boolean;
    getWaypointById: (id: number) => Waypoint | undefined;
    selectSegment: (id: number) => void;
    selected?: boolean;
}

export interface RenderShapeOptions {
    map: L.Map;
    g: RenderGroupSelection;
    shape: Shape;
    points: RenderPoint[];
    showOriginalShapeEdges: boolean;
    showOriginalShapeVertices: boolean;
    showShapeControlPointEdges: boolean;
    labelColor: string;
    showSolidBlockBehindLabel: boolean;
}
