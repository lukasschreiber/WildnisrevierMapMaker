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

export default function App() {
   
    const [activeTab, setActiveTab] = useLocalStorage<null | "settings" | "types" | "io" | "waypoints">("active-tab", null);
    const [view, setView] = useLocalStorage("map-view", {
        lat: 52.52,
        lng: 13.405,
        zoom: 13,
    });

    return (
        <>
            <MapContainer center={[view.lat, view.lng]} zoom={view.zoom} style={{ height: "100vh", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={22} maxNativeZoom={18} />
                <MapPersister setView={setView} />
                <ScaleControl position="bottomleft" imperial={false} />
                <WaypointOverlay />
                <LocationMarker />
                <Menu activeTab={activeTab} setActiveTab={setActiveTab} />
            </MapContainer>

            {activeTab && (
                <div className="absolute top-0 right-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3 h-full overflow-auto">
                    {activeTab === "settings" && <SettingsContainer />}
                    {activeTab === "types" && <WaypointTypeConfigContainer />}
                    {activeTab === "io" && <ExportContainer />}
                    {activeTab === "waypoints" && <WaypointListContainer />}
                </div>
            )}

            
        </>
    );
}
