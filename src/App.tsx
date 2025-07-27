import useLocalStorage from "./hooks/useLocalStorage";
import { Menu } from "./components/Menu";
import { FileLaunchHandler } from "./FileLaunchHandler";
import { SidePanel } from "./components/SidePanel";
import { WaypointLayer } from "./renderer/layers/WaypointLayer";
import { LayerProvider } from "./context/LayerContext";
import { MapEventManager } from "./components/MapEventManager";
import { WaypointArrowLayer } from "./renderer/layers/WaypointArrowLayer";
import { ShapeLayer } from "./renderer/layers/ShapeLayer";
import { Map } from "./components/Map";
import { PathLayer } from "./renderer/layers/PathsLayer";
import { Sidebar } from "./componentsV2/Sidebar";
import { MapSwitcher } from "./componentsV2/MapSwitcher";
import { ZoomOverlay } from "./componentsV2/ZoomOverlay";
import MenuDrawer from "./componentsV2/MenuDrawer";

export default function App() {
    // const [activeTab, setActiveTab] = useLocalStorage("activeTab", "waypoints");

    return (
        <div className="flex h-screen w-screen flex-row">
            <Sidebar />
            <MenuDrawer />
            <FileLaunchHandler />
            <Map>
                <LayerProvider>
                    <ShapeLayer debugging />
                    <PathLayer debugging />
                    <WaypointLayer />
                    <WaypointArrowLayer />
                    {/* <LocationMarker /> */}
                </LayerProvider>
                <MapEventManager />
                <MapSwitcher />
                <ZoomOverlay />
                {/* <Menu showSidePanel={true} setShowSidePanel={() => {}} /> */}
                {/* <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} /> */}
            </Map>
        </div>
    );
}
