import { useMap } from "react-leaflet";
import { usePathContext } from "../context/PathContext";
import { useWaypointContext } from "../context/WaypointContext";
import { SegmentInfo } from "./SegmentInfo";
import { WaypointInfo } from "./WaypointInfo";
import L from "leaflet";
import { useEffect, useRef } from "react";

export function Menu(props: { showSidePanel: boolean, setShowSidePanel: (show: boolean) => void }) {
    const { addMode, setAddMode, selectedId, setCurrentPosition, currentPosition } = useWaypointContext();
    const { addMode: addPathMode, setAddMode: setAddPathMode, selectedId: selectedSegmentId } = usePathContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const map = useMap();

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
        }
    }, [containerRef.current]);

    return (
        <div
            ref={containerRef}
            className="absolute top-0 left-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3"
            id="menu"
        >
            {!selectedId && !selectedSegmentId && <div className="text-xs">No Waypoint or Segment Selected</div>}
            {selectedId ? <WaypointInfo id={selectedId} /> : null}
            {selectedSegmentId ? <SegmentInfo id={selectedSegmentId} /> : null}
            <hr className="my-2 border-black opacity-40" />
            <div>
                <div className="text-xs mb-1">Mode:</div>
                <select
                    className="w-full bg-black/50 p-1 rounded-md"
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
            <hr className="my-2 border-black opacity-40" />
            <div className="flex flex-row items-center gap-2">
                <input
                    type="checkbox"
                    id="showSidePanel"
                    checked={props.showSidePanel}
                    onChange={() => props.setShowSidePanel(!props.showSidePanel)}
                />
                <label htmlFor="showSidePanel" className="text-xs">
                    Show Side Panel
                </label>
            </div>
            <hr className="my-2 border-black opacity-40" />
            <div className="flex flex-col gap-1">
                <button
                    className="bg-black/50 p-1 rounded-md cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => {
                        setCurrentPosition(null);
                        map.locate({ enableHighAccuracy: true }).on("locationfound", function (e) {
                            setCurrentPosition(e.latlng);
                            map.flyTo(e.latlng, map.getZoom());
                        });
                    }}
                >
                    Locate Me
                </button>
                {currentPosition && (
                    <button
                        className="bg-black/50 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
                        onClick={() => {
                            map.flyTo(currentPosition, map.getZoom());
                        }}
                    >
                        Center Map
                    </button>
                )}
                {currentPosition && (
                    <button
                        className="bg-black/50 p-1 rounded-md mt-2 cursor-pointer hover:bg-black/30 transition-colors"
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
