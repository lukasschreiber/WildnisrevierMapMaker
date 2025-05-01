import { MapContainer, ScaleControl, TileLayer } from "react-leaflet";
import useLocalStorage from "./hooks/useLocalStorage";
import { MapPersister } from "./components/MapPersister";
import { Menu } from "./components/Menu";
import { LocationMarker } from "./components/LocationMarker";
import { FileLaunchHandler } from "./FileLaunchHandler";
import { SidePanel } from "./components/SidePanel";
import { WaypointLayer } from "./renderer/layers/WaypointLayer";
import { LayerProvider } from "./context/LayerContext";
import { MapEventManager } from "./components/MapEventManager";
import { WaypointArrowLayer } from "./renderer/layers/WaypointArrowLayer";
import { SegmentLayer } from "./renderer/layers/SegmentLayer";
import { ShapeLayer } from "./renderer/layers/ShapeLayer";

export default function App() {
    const [showSidePanel, setShowSidePanel] = useLocalStorage("show-side-panel", false);
    const [activeTab, setActiveTab] = useLocalStorage("active-tab", "waypoints");
    const [view, setView] = useLocalStorage("view", {
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
                    <ShapeLayer />
                    <SegmentLayer />
                    <WaypointLayer />
                    <WaypointArrowLayer />
                    <LocationMarker />
                </LayerProvider>
                <MapEventManager />
                <ScaleControl position="bottomleft" imperial={false} />
                <MapPersister setView={setView} />
                <Menu showSidePanel={showSidePanel} setShowSidePanel={setShowSidePanel} />
                {showSidePanel && <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} />}
            </MapContainer>
        </>
    );
}
