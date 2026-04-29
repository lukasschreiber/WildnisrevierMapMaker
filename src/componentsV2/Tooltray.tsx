import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CursorLinear,
    DrawSquareLinear,
    LocationPlusLinear,
    ScribbleLinear,
    ChevronUpLinear,
    TrashLinear,
    WrenchLinear,
    LocationCrosshairsLinear,
    CompassDraftingLinear,
    RulerLinear,
    ArrowLeftLinear,
    ArrowRightLinear,
} from "@lukasschreiber/icons";

import { DisablePropagation } from "./common/DisablePropagation";
import { Divider } from "./common/Divider";
import { useLocation } from "react-router";
import { useMap } from "../context/MapContext";
import { useInteractionModeStore } from "../stores/useInteractionMode";
import { useWaypointStore } from "../stores/useWaypoints";
import { useHistoryStore } from "../stores/useHistory";

type ToolId = "select" | "marker" | "path" | "shape" | "delete" | "locate" | "measure" | "relative-marker" | "undo" | "redo";

type ToolDefinition = {
    id: ToolId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    selectable?: boolean;
    disabled?: () => boolean;
    onClick?: () => void;
};

type ToolGroup = ToolDefinition[];

function getSelectedToolIdFromState(mode: "select" | "waypoint-add" | "path-edit" | "shape-edit"): ToolId {
    if (mode === "waypoint-add") {
        return "marker";
    }

    if (mode === "path-edit") {
        return "path";
    }

    if (mode === "shape-edit") {
        return "shape";
    }

    return "select";
}

export function Tooltray() {
    const [isOpen, setIsOpen] = useState(true);

    const mode = useInteractionModeStore((state) => state.mode);
    const activateSelect = useInteractionModeStore((state) => state.activateSelect);
    const activateWaypointAdd = useInteractionModeStore((state) => state.activateWaypointAdd);
    const setCurrentPosition = useWaypointStore((state) => state.setCurrentPosition);
    const canUndo = useHistoryStore((state) => state.canUndo());
    const canRedo = useHistoryStore((state) => state.canRedo());
    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);

    const map = useMap();

    const selectedToolId = getSelectedToolIdFromState(mode);

    const toolGroups: ToolGroup[] = useMemo(() => {
        return [
            [
                {
                    id: "select",
                    label: "Select",
                    icon: CursorLinear,
                    selectable: true,
                    onClick: () => {
                        activateSelect();
                    },
                },
                {
                    id: "measure",
                    label: "Measure",
                    icon: RulerLinear,
                    selectable: true,
                    onClick: () => {
                        activateSelect();
                    },
                },
                {
                    id: "marker",
                    label: "Marker",
                    icon: LocationPlusLinear,
                    selectable: true,
                    onClick: () => {
                        activateWaypointAdd();
                    },
                },
                {
                    id: "path",
                    label: "Path",
                    icon: ScribbleLinear,
                    selectable: true,
                    onClick: () => {
                        activateSelect();
                    },
                },
                {
                    id: "shape",
                    label: "Shape",
                    icon: DrawSquareLinear,
                    selectable: true,
                    onClick: () => {
                        activateSelect();
                    },
                },
            ],
            [
                {
                    id: "delete",
                    label: "Delete",
                    icon: TrashLinear,
                    selectable: false,
                    disabled: () => true,
                },
                {
                    id: "relative-marker",
                    label: "Marker+",
                    icon: CompassDraftingLinear,
                    selectable: false,
                    disabled: () => true,
                },
                {
                    id: "locate",
                    label: "Locate",
                    icon: LocationCrosshairsLinear,
                    selectable: false,
                    onClick: () => {
                        setCurrentPosition(null);
                        map.locate({ enableHighAccuracy: true }).on("locationfound", function (e) {
                            setCurrentPosition(e.latlng);
                            map.flyTo(e.latlng, map.getZoom());
                        });
                    },
                },
            ],
            [
                {
                    id: "undo",
                    label: "Undo",
                    icon: ArrowLeftLinear,
                    selectable: false,
                    disabled: () => !canUndo,
                    onClick: () => {
                        undo();
                    }
                },
                {
                    id: "redo",
                    label: "Redo",
                    icon: ArrowRightLinear,
                    selectable: false,
                    disabled: () => !canRedo,
                    onClick: () => {
                        redo();
                    },
                }
            ]
        ];
    }, [activateSelect, activateWaypointAdd, map, setCurrentPosition, canUndo, canRedo, undo, redo]);

    const location = useLocation();
    const isPanelVisible = location.pathname !== "/";

    const selectedTool = useMemo(
        () => toolGroups.flat().find((tool) => tool.id === selectedToolId),
        [selectedToolId, toolGroups],
    );

    const CollapsedIcon = selectedTool?.icon ?? WrenchLinear;

    return (
        <DisablePropagation className={`absolute bottom-22 z-1000 ${isPanelVisible ? "left-76" : "left-4 "}`}>
            <motion.div layout className="overflow-hidden rounded-md bg-white shadow-lg">
                <button
                    type="button"
                    onClick={() => setIsOpen((v) => !v)}
                    className="flex h-5 w-full items-center justify-center bg-blue-500 hover:bg-blue-600"
                    aria-label={isOpen ? "Collapse tool tray" : "Expand tool tray"}
                >
                    <motion.div animate={{ rotate: isOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
                        <ChevronUpLinear className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                </button>

                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            key="tools"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col items-center gap-1 p-1">
                                {toolGroups.map((group, index) => (
                                    <React.Fragment key={index}>
                                        {group.map((tool) => {
                                            const Icon = tool.icon;
                                            const isSelected = tool.id === selectedToolId;
                                            const isDisabled = tool.disabled?.() ?? false;

                                            return (
                                                <button
                                                    key={tool.id}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => {
                                                        tool.onClick?.();
                                                    }}
                                                    className={[
                                                        "flex w-10 flex-col items-center justify-center rounded-md p-1 transition-colors",
                                                        isSelected
                                                            ? "bg-blue-100 text-blue-500 hover:bg-blue-200"
                                                            : "text-gray-600 hover:bg-gray-100",
                                                        isDisabled
                                                            ? "cursor-not-allowed opacity-40 hover:bg-transparent"
                                                            : "cursor-pointer",
                                                    ].join(" ")}
                                                    aria-pressed={tool.selectable !== false ? isSelected : undefined}
                                                    aria-label={tool.label}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <div className="text-[7pt]">{tool.label}</div>
                                                </button>
                                            );
                                        })}

                                        {index < toolGroups.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                    {!isOpen && (
                        <motion.div
                            key="collapsed-icon"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center justify-center p-1">
                                <div className="flex w-10 flex-col items-center justify-center rounded-md bg-blue-100 p-1 text-blue-500">
                                    <CollapsedIcon className="h-4 w-4" />
                                    <div className="text-[7pt]">{selectedTool?.label ?? "Tools"}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DisablePropagation>
    );
}
