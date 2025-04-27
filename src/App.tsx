import { MapContainer, ScaleControl, TileLayer } from "react-leaflet";
import useLocalStorage from "./hooks/useLocalStorage";
import { WaypointOverlay } from "./components/WaypointOverlay";
import { MapPersister } from "./components/MapPersister";
import { SettingsContainer } from "./components/SettingsContainer";
import { WaypointTypeConfigContainer } from "./components/WaypointTypeConfigContainer";
import { ExportContainer } from "./components/ExportContainer";
import { WaypointListContainer } from "./components/WaypointListContainer";
import { Menu } from "./components/Menu";
import { LocationMarker } from "./components/LocationMarker";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { FileLaunchHandler } from "./FileLaunchHandler";

export default function App() {
    const containerRef = useRef<HTMLDivElement>(null);

    const [showSidePanel, setShowSidePanel] = useLocalStorage("show-side-panel", false);
    const [activeTab, setActiveTab] = useLocalStorage<null | "settings" | "types" | "io" | "waypoints">(
        "active-tab",
        null
    );
    const [view, setView] = useLocalStorage("map-view", {
        lat: 52.52,
        lng: 13.405,
        zoom: 13,
    });

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
            L.DomEvent.addListener(containerRef.current, "wheel", L.DomEvent.stopPropagation);
        }
    }, [containerRef.current]);

    return (
        <>
            <FileLaunchHandler />
            <MapContainer center={[view.lat, view.lng]} zoom={view.zoom} style={{ height: "100vh", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={22} maxNativeZoom={18} />
                <MapPersister setView={setView} />
                <ScaleControl position="bottomleft" imperial={false} />
                <WaypointOverlay />
                <LocationMarker />
                <Menu showSidePanel={showSidePanel} setShowSidePanel={setShowSidePanel} />
                {activeTab && showSidePanel && (
                    <div
                        className="absolute top-0 right-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3 h-full"
                        ref={containerRef}
                    >
                        <div>
                            {/* tabs */}
                            <div className="flex flex-row gap-2 w-full justify-end">
                                <button
                                    className={`p-2 rounded-md ${activeTab === "settings" ? "bg-blue-500" : ""}`}
                                    onClick={() => setActiveTab("settings")}
                                >
                                    Settings
                                </button>
                                <button
                                    className={`p-2 rounded-md ${activeTab === "types" ? "bg-blue-500" : ""}`}
                                    onClick={() => setActiveTab("types")}
                                >
                                    Waypoint Types
                                </button>
                                <button
                                    className={`p-2 rounded-md ${activeTab === "io" ? "bg-blue-500" : ""}`}
                                    onClick={() => setActiveTab("io")}
                                >
                                    I/O
                                </button>
                                <button
                                    className={`p-2 rounded-md ${activeTab === "waypoints" ? "bg-blue-500" : ""}`}
                                    onClick={() => setActiveTab("waypoints")}
                                >
                                    Waypoints
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto">
                            {activeTab === "settings" && <SettingsContainer />}
                            {activeTab === "types" && <WaypointTypeConfigContainer />}
                            {activeTab === "io" && <ExportContainer />}
                            {activeTab === "waypoints" && <WaypointListContainer />}
                        </div>
                    </div>
                )}
            </MapContainer>
        </>
    );
}
