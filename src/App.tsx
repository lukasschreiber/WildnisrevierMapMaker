import { MapContainer, ScaleControl, TileLayer } from "react-leaflet";
import useLocalStorage from "./hooks/useLocalStorage";
import { useWaypointContext } from "./context/WaypointContext";
import { WaypointInfo } from "./components/WaypointInfo";
import { WaypointOverlay } from "./components/WaypointOverlay";
import { MapPersister } from "./components/MapPersister";
import { SettingsContainer } from "./components/SettingsContainer";
import { WaypointTypeConfigContainer } from "./components/WaypointTypeConfigContainer";
import { usePathContext } from "./context/PathContext";
import { SegmentInfo } from "./components/SegmentInfo";
import { ExportContainer } from "./components/ExportContainer";
import { WaypointListContainer } from "./components/WaypointListContainer";

export default function App() {
    const { addMode, setAddMode, selectedId } = useWaypointContext();
    const { addMode: addPathMode, setAddMode: setAddPathMode, selectedId: selectedSegmentId } = usePathContext();
    const [activeTab, setActiveTab] = useLocalStorage<null | "settings" | "types" | "io" | "waypoints">("active-tab", null);
    const [view, setView] = useLocalStorage("map-view", {
        lat: 52.52,
        lng: 13.405,
        zoom: 13,
    });

    return (
        <>
            <MapContainer center={[view.lat, view.lng]} zoom={view.zoom} style={{ height: "100vh", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={20} maxNativeZoom={18} />
                <MapPersister setView={setView} />
                <ScaleControl position="bottomleft" imperial={false} />
                <WaypointOverlay />
            </MapContainer>

            {activeTab && (
                <div className="absolute top-0 right-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3 h-full overflow-auto">
                    {activeTab === "settings" && <SettingsContainer />}
                    {activeTab === "types" && <WaypointTypeConfigContainer />}
                    {activeTab === "io" && <ExportContainer />}
                    {activeTab === "waypoints" && <WaypointListContainer />}
                </div>
            )}

            <div className="absolute top-0 left-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3">
                {selectedId ? <WaypointInfo id={selectedId} /> : <p className="text-xs">No Waypoint Selected</p>}
                {selectedSegmentId ? <SegmentInfo id={selectedSegmentId} /> : <p className="text-xs">No Segment Selected</p>}
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
                        value={activeTab || ""}
                        onChange={(e) => {
                            const value = e.target.value as "settings" | "types" | "io" | "";
                            if (value) {
                                setActiveTab(value);
                            } else {
                                setActiveTab(null);
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
            </div>
        </>
    );
}
