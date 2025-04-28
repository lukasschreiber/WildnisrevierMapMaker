import { MapContainer, ScaleControl, TileLayer } from "react-leaflet";
import useLocalStorage from "./hooks/useLocalStorage";
import { MapPersister } from "./components/MapPersister";
import { Menu } from "./components/Menu";
import { LocationMarker } from "./components/LocationMarker";
import { FileLaunchHandler } from "./FileLaunchHandler";
import { SidePanel } from "./components/SidePanel";
import { LayerProvider } from "./context/LayerContext";
import { WaypointLayer } from "./renderer/layers/WaypointLayer";
import { WaypointOverlay } from "./renderer/WaypointOverlay";
import { SegmentLayer } from "./renderer/layers/SegmentLayer";

export default function App() {
    const [showSidePanel, setShowSidePanel] = useLocalStorage("show-side-panel", false);
    const [activeTab, setActiveTab] = useLocalStorage("active-tab", "waypoints");
    const [view, setView] = useLocalStorage("map-view", {
        lat: 52.52,
        lng: 13.405,
        zoom: 13,
    });

    return (
        <>
            <FileLaunchHandler />
            <MapContainer center={[view.lat, view.lng]} zoom={view.zoom} style={{ height: "100vh", width: "100%" }}>
                <LayerProvider>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={22}
                        maxNativeZoom={18}
                    />
                    <MapPersister setView={setView} />
                    <ScaleControl position="bottomleft" imperial={false} />
                    {/* <WaypointOverlay /> */}
                    {/* <SegmentLayer /> */}
                    <WaypointLayer />
                    <LocationMarker />
                    <Menu showSidePanel={showSidePanel} setShowSidePanel={setShowSidePanel} />
                    {showSidePanel && <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} />}
                </LayerProvider>
            </MapContainer>
        </>
    );
}
