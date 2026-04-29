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
} from "@lukasschreiber/icons";

import { DisablePropagation } from "./common/DisablePropagation";
import { Divider } from "./common/Divider";
import { useLocation } from "react-router";
import { useWaypointStore } from "../stores/useWaypoints";
import { useMap } from "../context/MapContext";

type ToolId = "select" | "marker" | "path" | "shape" | "delete" | "locate" | "measure";

type ToolDefinition = {
    id: ToolId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    selectable?: boolean;
    disabled?: () => boolean;
    onClick?: () => void;
};

type ToolGroup = ToolDefinition[];

function getSelectedToolIdFromState(addMode: boolean): ToolId {
    if (addMode) {
        return "marker";
    }

    return "select";
}

export function Tooltray() {
    const [isOpen, setIsOpen] = useState(true);

    const setCurrentPosition = useWaypointStore((state) => state.setCurrentPosition);
    const addMode = useWaypointStore((state) => state.addMode);
    const setAddMode = useWaypointStore((state) => state.setAddMode);

    const map = useMap();

    const selectedToolId = getSelectedToolIdFromState(addMode);

    const toolGroups: ToolGroup[] = useMemo(() => {
        return [
            [
                {
                    id: "select",
                    label: "Select",
                    icon: CursorLinear,
                    selectable: true,
                    onClick: () => {
                        setAddMode(false);
                    },
                },
                {
                    id: "measure",
                    label: "Measure",
                    icon: CompassDraftingLinear,
                    selectable: false,
                },
                {
                    id: "marker",
                    label: "Marker",
                    icon: LocationPlusLinear,
                    selectable: true,
                    onClick: () => {
                        setAddMode(true);
                    },
                },
                {
                    id: "path",
                    label: "Path",
                    icon: ScribbleLinear,
                    selectable: true,
                    onClick: () => {
                        setAddMode(false);
                    },
                },
                {
                    id: "shape",
                    label: "Shape",
                    icon: DrawSquareLinear,
                    selectable: true,
                    onClick: () => {
                        setAddMode(false);
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
        ];
    }, [map, setAddMode, setCurrentPosition]);

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
