import { useLocation, useNavigate } from "react-router";
import MenuIcon from "../assets/icons/menu.svg?react";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";
import { useEffect, useRef, useState, useMemo } from "react";
import { useWaypointTypeStore } from "../stores/useWaypointTypes";
import { useWaypointStore } from "../stores/useWaypoints";
import { LegendWaypointMarker } from "../components/legend/LegendWaypointMarker";
import { TopChipList } from "./TopChipList";
import { useClickOutside } from "../hooks/useClickOutside";
import LocationPlusIcon from "../assets/icons/location-plus.svg?react";
import { TextInput } from "./controls/TextInput";
import { Select } from "./controls/Select";
import { Chip } from "./common/Chip";

export function TopIsle() {
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
                navigate(`/waypoints/${wp.id}`);
                setInputFocused(false);
            }}
            className="flex items-center gap-2 focus:outline-none"
        >
            <LegendWaypointMarker type={types[wp.typeId]} radius={8} borderWidth={1} borderColor="black" />
            <span className="text-sm text-gray-800">{wp.name ? `${wp.id} (${wp.name})` : wp.id}</span>
        </Chip>
    ));

    const randomChips = useMemo(() => {
        return Array.from({ length: 10 }).map((_, i) => (
            <Chip key={i}>
                <div className="w-4 h-4 rounded-full bg-blue-300" />
                <span className="text-sm text-gray-800">{`Chip ${i + 1}`}</span>
            </Chip>
        ));
    }, []);

    return (
        <DisablePropagation>
            <div className={`absolute top-0 z-[1003] m-4`}>
                <div className="flex flex-wrap gap-2 w-64 md:w-[calc(100vw-2rem)]">
                    <div className="flex flex-col">
                        <div
                            className={`bg-white w-64 flex flex-col items-center py-2 justify-between border ${isPanelVisible && !inputFocussed ? "border-gray-200" : "shadow-lg border-white"} ${inputFocussed ? "rounded-t-2xl !border-gray-200 rounded-b-2xl" : "rounded-2xl"} transition-all duration-200 ease-in-out`}
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
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
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
                                        {filteredWaypoints.length === 0 && (
                                            <div className="px-2 mx-2 text-gray-500 text-xs">No waypoints found</div>
                                        )}
                                        {filteredWaypoints.map((waypoint) => (
                                            <div
                                                key={waypoint.id}
                                                className={`flex px-2 mx-2 hover:bg-gray-100 rounded-md py-2 items-center gap-2 text-xs cursor-pointer`}
                                                onClick={() => {
                                                    navigate(`/waypoints/${waypoint.id}`);
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
                                            value={newWaypointName}
                                            onChange={(value) => setNewWaypointName(value)}
                                            type="text"
                                            placeholder="Name"
                                            helpText="New Waypoints will be given this name, leave it empty to enter a name per Waypoint"
                                        />
                                        <Select
                                            label="Type"
                                            value={newWaypointType}
                                            onChange={setNewWaypointType}
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
                                    <LocationPlusIcon className="w-4 h-4 inline-block" />
                                    {newWaypointName !== "" && <>Name: {newWaypointName} -</>} Type:{" "}
                                    {types[newWaypointType]?.name || "Unknown"}
                                </div>
                            </div>
                        )}
                    </div>
                    {(randomChips.length > 0 || bubbleItems.length > 0) && (
                        <TopChipList
                            items={[...randomChips, ...bubbleItems]}
                            className={`order-2 w-64 mt-0 md:order-none md:flex-1 md:min-w-0 md:w-[calc(100vw-30rem)] md:max-w-[calc(100vw-30rem)] ${isPanelVisible ? "ml-4 hidden md:block" : ""}`}
                        />
                    )}
                </div>
            </div>
        </DisablePropagation>
    );
}
