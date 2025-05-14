import { TileLayerVersion } from "../utils/tiles";
import { CheckboxSetting, ColorSetting, defineSettings, RangeSetting, SelectSetting } from "./settings_definition";

export interface LayoutSettings {
    showWaypointLines: CheckboxSetting;
    showWaypointDistances: CheckboxSetting;
    showLabels: CheckboxSetting;
    waypointRadius: RangeSetting;
    waypointBorderWidth: RangeSetting;
    waypointBorderColor: ColorSetting;
    showWaypointBorder: CheckboxSetting;

    mapVersion: SelectSetting<TileLayerVersion>;
    maxZoom: RangeSetting;

    arrowOpacity: RangeSetting;
    arrowSize: RangeSetting;
    arrowColor: ColorSetting;
    arrowWidth: RangeSetting;
    labelColor: ColorSetting;

    showSinglePaths: CheckboxSetting;
    pathWidth: RangeSetting;
    pathOutlineWidth: RangeSetting;
    pathOutlineColor: ColorSetting;
    pathColor: ColorSetting;
    hideOriginalPaths: CheckboxSetting;
    hideFancyPaths: CheckboxSetting;
    pathTension: RangeSetting;

    showOriginalShapeEdges: CheckboxSetting;
    showOriginalShapeVertices: CheckboxSetting;
    showShapeControlPointEdges: CheckboxSetting;
    shapeLabelColor: ColorSetting;
    showSolidBlockBehindLabels: CheckboxSetting;

    hideArrowsInExport: CheckboxSetting;
    hideHiddenWaypointsInExport: CheckboxSetting;
    hideDistancesInExport: CheckboxSetting;
    hideOriginalPathsInExport: CheckboxSetting;
}

export function getSettingsDefinition() {
    return defineSettings([
        {
            name: "Map Settings",
            settings: {
                mapVersion: {
                    type: "select",
                    default: TileLayerVersion.OSM,
                    label: "Map Version",
                    helpText: "Select the map version to use.",
                    options: [
                        { value: TileLayerVersion.OSM, label: "OpenStreetMap" },
                        { value: TileLayerVersion.Voyager, label: "Voyager" },
                        { value: TileLayerVersion.LightAll, label: "Carto Light" },
                        { value: TileLayerVersion.DarkAll, label: "Carto Dark" },
                        { value: TileLayerVersion.Liberty, label: "Liberty" },
                    ],
                },
                maxZoom: {
                    type: "range",
                    default: 22,
                    min: 1,
                    max: 30,
                    stepSize: 1,
                    label: "Max Zoom Level",
                    helpText: "Maximum zoom level for the map.",
                },
            },
        },
        {
            name: "Waypoint Settings",
            settings: {
                showWaypointDistances: {
                    type: "checkbox",
                    default: true,
                    label: "Show Waypoint Distances",
                    helpText: "Show distances between waypoints and their base waypoint.",
                },
                showLabels: {
                    type: "checkbox",
                    default: true,
                    label: "Show Labels",
                    helpText: "Show labels on the map.",
                },
                waypointRadius: {
                    type: "range",
                    default: 10,
                    min: 1,
                    max: 50,
                    stepSize: 1,
                    label: "Waypoint Radius",
                    helpText: "Radius of the waypoint markers.",
                },
                waypointBorderWidth: {
                    type: "range",
                    default: 2,
                    min: 0,
                    max: 10,
                    stepSize: 1,
                    label: "Waypoint Border Width",
                    helpText: "Width of the waypoint border.",
                },
                waypointBorderColor: {
                    type: "color",
                    default: "#000000",
                    label: "Waypoint Border Color",
                    helpText: "Color of the waypoint border.",
                },
                showWaypointBorder: {
                    type: "checkbox",
                    default: true,
                    label: "Show Waypoint Border",
                    helpText: "Show border around waypoints.",
                },
                labelColor: {
                    type: "color",
                    default: "#000000",
                    label: "Label Color",
                    helpText: "Color of the labels.",
                },
            },
        },
        {
            name: "Arrow Settings",
            settings: {
                showWaypointLines: {
                    type: "checkbox",
                    default: true,
                    label: "Show Arrows",
                    helpText: "Show lines connecting waypoints to their base waypoint.",
                },
                arrowOpacity: {
                    type: "range",
                    default: 0.8,
                    min: 0,
                    max: 1,
                    stepSize: 0.1,
                    label: "Arrow Opacity",
                    helpText: "Opacity of the arrows.",
                },
                arrowSize: {
                    type: "range",
                    default: 10,
                    min: 1,
                    max: 50,
                    stepSize: 1,
                    label: "Arrow Size",
                    helpText: "Size of the arrows.",
                },
                arrowColor: {
                    type: "color",
                    default: "#FF0000",
                    label: "Arrow Color",
                    helpText: "Color of the arrows.",
                },
                arrowWidth: {
                    type: "range",
                    default: 2,
                    min: 1,
                    max: 10,
                    stepSize: 1,
                    label: "Arrow Width",
                    helpText: "Width of the arrows.",
                },
            },
        },
        {
            name: "Path Settings",
            settings: {
                showSinglePaths: {
                    type: "checkbox",
                    default: true,
                    label: "Use a unique color for each path",
                    helpText: "Show paths between waypoints.",
                },
                pathWidth: {
                    type: "range",
                    default: 5,
                    min: 1,
                    max: 20,
                    stepSize: 1,
                    label: "Path Width",
                    helpText: "Width of the paths.",
                },
                pathColor: {
                    type: "color",
                    default: "#00FF00",
                    label: "Path Color",
                    helpText: "Color of the paths.",
                },
                pathOutlineWidth:{
                    type: "range",
                    default: 1,
                    min: 0,
                    max: 10,
                    stepSize: 1,
                    label: "Path Outline Width",
                    helpText: "Width of the path outline.",
                },
                pathOutlineColor: {
                    type: "color",
                    default: "#000000",
                    label: "Path Outline Color",
                    helpText: "Color of the path outline.",
                },
                hideOriginalPaths: {
                    type: "checkbox",
                    default: false,
                    label: "Hide Original Paths",
                    helpText: "Hide the original paths.",
                },
                hideFancyPaths: {
                    type: "checkbox",
                    default: false,
                    label: "Hide Fancy Paths",
                    helpText: "Hide the fancy paths.",
                },
                pathTension: {
                    type: "range",
                    default: 0.5,
                    min: 0,
                    max: 1,
                    stepSize: 0.05,
                    label: "Path Tension",
                    helpText: "Tension of the paths.",
                },
            },
        },
        {
            name: "Shape Settings",
            settings: {
                showOriginalShapeEdges: {
                    type: "checkbox",
                    default: true,
                    label: "Show Original Shape Edges",
                    helpText: "Show edges of the original shapes.",
                },
                showOriginalShapeVertices: {
                    type: "checkbox",
                    default: true,
                    label: "Show Original Shape Vertices",
                    helpText: "Show vertices of the original shapes.",
                },
                showShapeControlPointEdges: {
                    type: "checkbox",
                    default: true,
                    label: "Show Shape Control Point Edges",
                    helpText: "Show control points.",
                },
                shapeLabelColor: {  
                    type: "color",
                    default: "#FFFFFF",
                    label: "Shape Label Color",
                    helpText: "Color of the shape labels.",
                },
                showSolidBlockBehindLabels: {
                    type: "checkbox",
                    default: true,
                    label: "Show Solid Block Behind Labels",
                    helpText: "Show a solid block behind the labels.",
                },
            }
        },
        {
            name: "Export Settings",
            settings: {
                hideArrowsInExport: {
                    type: "checkbox",
                    default: false,
                    label: "Hide Arrows in Export",
                    helpText: "Hide arrows in the exported image.",
                },
                hideHiddenWaypointsInExport: {
                    type: "checkbox",
                    default: false,
                    label: "Hide Hidden Waypoints in Export",
                    helpText: "Hide hidden waypoints in the exported image.",
                },
                hideDistancesInExport: {
                    type: "checkbox",
                    default: false,
                    label: "Hide Distances in Export",
                    helpText: "Hide distances in the exported image.",
                },
                hideOriginalPathsInExport: {
                    type: "checkbox",
                    default: false,
                    label: "Hide Original Paths in Export",
                    helpText: "Hide original paths in the exported image.",
                },
            },
        },
    ]);
}
