import { CheckboxSetting, ColorSetting, defineSettings, RangeSetting } from "./settings_definition";

export interface LayoutSettings {
    showWaypointLines: CheckboxSetting;
    showWaypointDistances: CheckboxSetting;
    showLabels: CheckboxSetting;
    waypointRadius: RangeSetting;
    waypointBorderWidth: RangeSetting;
    waypointBorderColor: ColorSetting;
    showWaypointBorder: CheckboxSetting;

    arrowOpacity: RangeSetting;
    arrowSize: RangeSetting;
    arrowColor: ColorSetting;
    arrowWidth: RangeSetting;

    showSinglePaths: CheckboxSetting;
    pathWidth: RangeSetting;
    pathColor: ColorSetting;
    hideOriginalPaths: CheckboxSetting;
    hideFancyPaths: CheckboxSetting;
}

export function getSettingsDefinition() {
    return defineSettings([
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
            },
        },
    ]);
}
