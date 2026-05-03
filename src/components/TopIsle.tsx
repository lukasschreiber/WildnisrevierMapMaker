import { useLocation, useNavigate } from "react-router";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";
import { useEffect, useRef, useState } from "react";
import { useWaypointTypeStore } from "../stores/useWaypointTypes";
import { useWaypointStore } from "../stores/useWaypoints";
import { LegendWaypointMarker } from "../components/legend/LegendWaypointMarker";
import { TopChipList } from "./TopChipList";
import { useClickOutside } from "../hooks/useClickOutside";
import { TextInput } from "./controls/TextInput";
import { Select } from "./controls/Select";
import { Chip } from "./common/Chip";
import { LocationPlusLinear, MenuLinear, XmarkLinear } from "@lukasschreiber/icons";
import { useInteractionsStore } from "../stores/useInteractions";
import { useSelectionActions } from "../hooks/useSelectionActions";
import { useMap } from "../context/useMap";

export function TopIsle() {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    const location = useLocation();
    const navigate = useNavigate();
    const { selectEntity } = useSelectionActions();
    const map = useMap();
    const [inputFocussed, setInputFocused] = useState(false);
    const [addModeSettingsOpen, setAddModeSettingsOpen] = useState(false);
    const types = useWaypointTypeStore((state) => state.types);
    const waypoints = useWaypointStore((state) => state.waypoints);
    const containerRef = useRef<HTMLDivElement>(null);
    const newWaypointConfig = useInteractionsStore((state) => state.newWaypointConfig);
    const updateNewWaypointConfig = useInteractionsStore((state) => state.updateNewWaypointConfig);

    const [searchValue, setSearchValue] = useState("");

    const isPanelVisible = location.pathname !== "/";
    useClickOutside(containerRef, () => {
        setInputFocused(false);
        setAddModeSettingsOpen(false);
    });

    useEffect(() => {
        if (inputFocussed) {
            setAddModeSettingsOpen(false);
        }
    }, [inputFocussed]);

    const filteredWaypoints = waypoints.filter((waypoint) => {
        const searchLower = searchValue.toLowerCase();
        return (
            waypoint.id.toString().includes(searchLower) ||
            (waypoint.name && waypoint.name.toLowerCase().includes(searchLower)) ||
            (waypoint.additionalText && waypoint.additionalText.toLowerCase().includes(searchLower))
        );
    });

    const bubbleItems = waypoints.map((wp) => (
        <Chip
            onClick={() => {
                selectEntity("waypoint", wp.id, {
                    focus: () => map.flyTo([wp.lat, wp.lng], 20),
                });
                setInputFocused(false);
            }}
            className="flex items-center gap-2 focus:outline-none"
        >
            <LegendWaypointMarker type={types[wp.typeId]} radius={8} borderWidth={1} borderColor="black" />
            <span className="text-sm text-gray-800">{wp.name ? `${wp.id} (${wp.name})` : wp.id}</span>
        </Chip>
    ));

    return (
        <DisablePropagation>
            <div className={`absolute top-0 z-1003 m-4`}>
                <div className="flex flex-wrap gap-2 w-64 md:w-[calc(100vw-2rem)]">
                    <div className="flex flex-col">
                        <div
                            className={`bg-white w-64 flex flex-col items-center py-2 justify-between border ${isPanelVisible && !inputFocussed ? "border-gray-200" : "shadow-lg border-white"} ${inputFocussed ? "rounded-t-2xl border-gray-200! rounded-b-2xl" : "rounded-2xl"} transition-all duration-200 ease-in-out`}
                            ref={containerRef}
                        >
                            <div className="flex items-center justify-between w-full px-4 ">
                                <div className="flex items-center flex-row gap-2 w-full">
                                    {!showSidebar && (
                                        <div
                                            className="flex flex-col items-center justify-center cursor-pointer text-gray-600"
                                            onClick={() => toggleMenu()}
                                        >
                                            <MenuLinear className="w-6 h-6" />
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className="flex-1 outline-none text-gray-800 text-sm"
                                        placeholder="Search..."
                                        onFocus={() => setInputFocused(true)}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                    {isPanelVisible && (
                                        <div
                                            className="flex flex-col items-center justify-center cursor-pointer text-gray-600 ml-auto"
                                            onClick={() => navigate("/")}
                                        >
                                            <XmarkLinear className="w-6 h-6" />
                                        </div>
                                    )}
                                    {addModeSettingsOpen && (
                                        <div
                                            className="flex flex-col items-center justify-center cursor-pointer text-gray-600 ml-auto"
                                            onClick={() => setAddModeSettingsOpen(false)}
                                        >
                                            <XmarkLinear className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {inputFocussed && (
                                <div className="flex flex-col pt-2 w-full">
                                    <div className="border-t border-gray-200 w-full" />

                                    <div className="flex flex-col pt-2">
                                        {filteredWaypoints.length === 0 && (
                                            <div className="px-2 mx-2 text-gray-500 text-xs">No waypoints found</div>
                                        )}
                                        {filteredWaypoints.map((waypoint) => (
                                            <div
                                                key={waypoint.id}
                                                className={`flex px-2 mx-2 hover:bg-gray-100 rounded-md py-2 items-center gap-2 text-xs cursor-pointer`}
                                                onClick={() => {
                                                    selectEntity("waypoint", waypoint.id, {
                                                        focus: () => map.flyTo([waypoint.lat, waypoint.lng], 20),
                                                    });
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
                                    <div className="flex flex-col gap-2 px-2 ">
                                        <TextInput
                                            label="Name"
                                            value={newWaypointConfig.name}
                                            onChange={(value) => updateNewWaypointConfig({ name: value })}
                                            type="text"
                                            placeholder="Name"
                                            helpText="New Waypoints will be given this name, leave it empty to enter a name per Waypoint"
                                        />
                                        <Select
                                            label="Type"
                                            value={newWaypointConfig.typeId}
                                            onChange={(value) => updateNewWaypointConfig({ typeId: Number(value) })}
                                            placeholder="Type"
                                            helpText="New Waypoints will be given this type"
                                            options={Object.values(types).map((type) => ({
                                                value: type.id,
                                                children: (
                                                    <div className="flex items-center gap-2">
                                                        <LegendWaypointMarker
                                                            type={type}
                                                            radius={8}
                                                            borderWidth={1}
                                                            borderColor="black"
                                                        />
                                                        <span>{type.name}</span>
                                                    </div>
                                                ),
                                            }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {!inputFocussed && !addModeSettingsOpen && !isPanelVisible && (
                            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-2">
                                <div
                                    className="ml-4 pb-0.5 bg-blue-500 text-white text-xs w-fit px-1 rounded-b-sm cursor-pointer"
                                    onClick={() => setAddModeSettingsOpen(!addModeSettingsOpen)}
                                >
                                    <LocationPlusLinear className="w-4 h-4 inline-block" />
                                    {newWaypointConfig.name !== "" && <>Name: {newWaypointConfig.name} -</>} Type:{" "}
                                    {types[newWaypointConfig.typeId]?.name || "Unknown"}
                                </div>
                            </div>
                        )}
                    </div>
                    {bubbleItems.length > 0 && (
                        <TopChipList
                            items={bubbleItems}
                            className={`order-2 w-64 mt-0 md:order-0 md:flex-1 md:min-w-0 md:w-[calc(100vw-30rem)] md:max-w-[calc(100vw-30rem)] ${isPanelVisible ? "ml-4 hidden md:block" : ""}`}
                        />
                    )}
                </div>
            </div>
        </DisablePropagation>
    );
}
