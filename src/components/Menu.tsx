import { useMap } from "react-leaflet";
import { usePathContext } from "../context/PathContext";
import { useWaypointContext } from "../context/WaypointContext";
import { SegmentInfo } from "./SegmentInfo";
import { WaypointInfo } from "./WaypointInfo";

export function Menu(props: {
    activeTab: null | "settings" | "types" | "io" | "waypoints";
    setActiveTab: (tab: null | "settings" | "types" | "io" | "waypoints") => void;
}) {
    const { addMode, setAddMode, selectedId, setCurrentPosition, currentPosition } = useWaypointContext();
    const { addMode: addPathMode, setAddMode: setAddPathMode, selectedId: selectedSegmentId } = usePathContext();
    const map = useMap();

    return (
        <div className="absolute top-0 left-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3" id="menu" onClick={(e) => e.stopPropagation()}>
            {selectedId ? <WaypointInfo id={selectedId} /> : <p className="text-xs">No Waypoint Selected</p>}
            {selectedSegmentId ? (
                <SegmentInfo id={selectedSegmentId} />
            ) : (
                <p className="text-xs">No Segment Selected</p>
            )}
            <hr className="my-2 border-black opacity-40" />
            <div>
                <div className="text-xs mb-1">Mode:</div>
                <select
                    className="w-full bg-black/20 p-1 rounded-md"
                    value={addMode ? "add" : addPathMode ? "paths" : "normal"}
                    onChange={(e) => {
                        const value = e.target.value as "add" | "paths" | "normal";
                        if (value === "add") {
                            setAddMode(true);
                        } else {
                            setAddMode(false);
                        }

                        if (value === "paths") {
                            setAddPathMode(true);
                        } else {
                            setAddPathMode(false);
                        }
                    }}
                >
                    <option value="normal">Normal</option>
                    <option value="add">Add</option>
                    <option value="paths">Add Paths</option>
                </select>
            </div>

            <div>
                <div className="flex flex-row justify-between gap-2">
                    <span>Add Waypoint Mode</span>
                    <span className={`text-xs ${addMode ? "text-green-500" : "text-red-500"}`}>
                        {addMode ? "ON" : "OFF"}
                    </span>
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <span>Add Path Mode</span>
                    <span className={`text-xs ${addPathMode ? "text-green-500" : "text-red-500"}`}>
                        {addPathMode ? "ON" : "OFF"}
                    </span>
                </div>
            </div>

            <div>
                <div className="text-xs mb-1">Side Panel:</div>
                <select
                    className="w-full bg-black/20 p-1 rounded-md"
                    value={props.activeTab || ""}
                    onChange={(e) => {
                        const value = e.target.value as "settings" | "types" | "io" | "";
                        if (value) {
                            props.setActiveTab(value);
                        } else {
                            props.setActiveTab(null);
                        }
                    }}
                >
                    <option value="">Nothing</option>
                    <option value="settings">Settings</option>
                    <option value="types">Waypoint Types</option>
                    <option value="io">I/O</option>
                    <option value="waypoints">Waypoints</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <button
                    className="bg-black/20 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => {
                        setCurrentPosition(null);
                        map.locate({enableHighAccuracy: true}).on("locationfound", function (e) {
                            setCurrentPosition(e.latlng);
                            map.flyTo(e.latlng, map.getZoom());
                        });
                    }}
                >
                    Locate Me
                </button>
                {currentPosition && (
                    <button
                        className="bg-black/20 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={() => {
                            map.flyTo(currentPosition, map.getZoom());
                        }}
                    >
                        Center Map
                    </button>
                )}
                {currentPosition && (
                    <button
                        className="bg-black/20 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={() => {
                            setCurrentPosition(null);
                        }}
                    >
                        Clear Location
                    </button>
                )}
            </div>
        </div>
    );
}
