import { useLocation, useNavigate } from "react-router";
import MenuIcon from "../assets/icons/menu.svg?react";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";
import { useRef, useState } from "react";
import { useWaypointTypeStore } from "../stores/useWaypointTypes";
import { useWaypointStore } from "../stores/useWaypoints";
import { LegendWaypointMarker } from "../components/legend/LegendWaypointMarker";
import { useClickOutside } from "../hooks/useClickOutside";

interface TopIsleProps {}

export function TopIsle({}: TopIsleProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    const location = useLocation();
    const navigate = useNavigate();
    const [inputFocussed, setInputFocused] = useState(false);
    const [addModeSettingsOpen, setAddModeSettingsOpen] = useState(false);
    const types = useWaypointTypeStore((state) => state.types);
    const waypoints = useWaypointStore((state) => state.waypoints);
    const containerRef = useRef<HTMLDivElement>(null);
    const newWaypointName = useWaypointStore((state) => state.newWaypointName);
    const newWaypointType = useWaypointStore((state) => state.newWaypointType);
    const setNewWaypointName = useWaypointStore((state) => state.setNewWaypointName);
    const setNewWaypointType = useWaypointStore((state) => state.setNewWaypointType);

    const isPanelVisible = location.pathname !== "/";
    useClickOutside(containerRef, () => {
        setInputFocused(false);
        setAddModeSettingsOpen(false);
    });

    return (
        <DisablePropagation>
            <div className={`absolute top-0 z-[1003] m-4`}>
                <div
                    className={`bg-white min-w-64 flex flex-col items-center py-2 justify-between border ${isPanelVisible && !inputFocussed ? "border-gray-200" : "shadow-lg border-white"} ${inputFocussed ? "rounded-t-2xl !border-gray-200 rounded-b-md" : "rounded-2xl"} transition-all duration-200 ease-in-out`}
                    ref={containerRef}
                >
                    <div className="flex items-center justify-between w-full px-4 ">
                        <div className="flex items-center flex-row gap-2 w-full">
                            {!showSidebar && (
                                <div
                                    className="flex flex-col items-center justify-center cursor-pointer text-gray-600"
                                    onClick={() => toggleMenu()}
                                >
                                    <MenuIcon className="w-6 h-6" />
                                </div>
                            )}
                            <input
                                type="text"
                                className="flex-1 outline-none text-gray-800 text-sm"
                                placeholder="Search..."
                                onFocus={() => setInputFocused(true)}
                            />
                            {isPanelVisible && (
                                <div
                                    className="flex flex-col items-center justify-center cursor-pointer text-gray-600 ml-auto"
                                    onClick={() => navigate("/")}
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </div>
                            )}
                            {addModeSettingsOpen && (
                                <div
                                    className="flex flex-col items-center justify-center cursor-pointer text-gray-600 ml-auto"
                                    onClick={() => setAddModeSettingsOpen(false)}
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    </div>
                    {inputFocussed && (
                        <div className="flex flex-col pt-2 w-full">
                            <div className="border-t border-gray-200 w-full" />

                            <div className="flex flex-col pt-2">
                                {waypoints.map((waypoint) => (
                                    <div
                                        key={waypoint.id}
                                        className={`flex px-2 mx-2 hover:bg-gray-100 rounded-md py-2 items-center gap-2 text-xs cursor-pointer`}
                                        onClick={() => {
                                            navigate(`/waypoint/${waypoint.id}`);
                                            setInputFocused(false);
                                        }}
                                    >
                                        <LegendWaypointMarker
                                            type={types[waypoint.typeId]}
                                            radius={8}
                                            borderWidth={1}
                                            borderColor="black"
                                        />
                                        <span>{waypoint.id}</span>
                                        {waypoint.name ? ` (${waypoint.name})` : ""}{" "}
                                        {waypoint.additionalText ? `- ${waypoint.additionalText}` : ""}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {addModeSettingsOpen && !isPanelVisible && (
                        <div className="flex flex-col pt-2 w-full gap-2">
                            <div className="border-t border-gray-200 w-full" />
                            <div className="flex items-center gap-2 px-2 ">
                                <input
                                    value={newWaypointName}
                                    onChange={(e) => setNewWaypointName(e.target.value)}
                                    type="text"
                                    placeholder="Name"
                                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                />
                                <select
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                    value={newWaypointType}
                                    onChange={(e) => setNewWaypointType(Number(e.target.value))}
                                >
                                    {Object.values(types).map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                {!inputFocussed && !addModeSettingsOpen && !isPanelVisible && (
                    <div
                        className="ml-4 bg-blue-500 text-white text-xs w-fit px-1 rounded-b-sm cursor-pointer"
                        onClick={() => setAddModeSettingsOpen(!addModeSettingsOpen)}
                    >
                        {newWaypointName !== "" && <>Name: {newWaypointName} -</>} Type:{" "}
                        {types[newWaypointType]?.name || "Unknown"}
                    </div>
                )}
            </div>
        </DisablePropagation>
    );
}
