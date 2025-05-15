import useLocalStorage from "./hooks/useLocalStorage";
import { Menu } from "./components/Menu";
import { FileLaunchHandler } from "./FileLaunchHandler";
import { SidePanel } from "./components/SidePanel";
import { WaypointLayer } from "./renderer/layers/WaypointLayer";
import { LayerProvider } from "./context/LayerContext";
import { MapEventManager } from "./components/MapEventManager";
import { WaypointArrowLayer } from "./renderer/layers/WaypointArrowLayer";
import { SegmentLayer } from "./renderer/layers/SegmentLayer";
import { ShapeLayer } from "./renderer/layers/ShapeLayer";
import { Map } from "./components/Map";

export default function App() {
    const [showSidePanel, setShowSidePanel] = useLocalStorage("show-side-panel", false);
    const [activeTab, setActiveTab] = useLocalStorage("active-tab", "waypoints");

    return (
        <>
            <FileLaunchHandler />
            <Map>
                <LayerProvider>
                    <ShapeLayer debugging />
                    <SegmentLayer debugging />
                    <WaypointLayer />
                    <WaypointArrowLayer />
                    {/* <LocationMarker /> */}
                </LayerProvider>
                <MapEventManager />
                <Menu showSidePanel={showSidePanel} setShowSidePanel={setShowSidePanel} />
                {showSidePanel && <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} />}
            </Map>
        </>
    );
}
