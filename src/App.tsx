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
import { Footer } from "./componentsV2/Footer";
import { useLayoutStore } from "./stores/useLayout";
import { TopIsle } from "./componentsV2/TopIsle";
import { Outlet } from "react-router";

export default function App() {
    // const [activeTab, setActiveTab] = useLocalStorage("activeTab", "waypoints");
    const showSidebar = useLayoutStore((state) => state.showSidebar);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex w-screen flex-row flex-1 relative">
                {showSidebar && <Sidebar />}
                <MenuDrawer />
                <FileLaunchHandler />
                <div className="relative">
                    <Outlet />
                </div>
                <TopIsle />
                <Map>
                    <LayerProvider>
                        <ShapeLayer debugging />
                        <PathLayer debugging />
                        <WaypointLayer />
                        <WaypointArrowLayer />
                    </LayerProvider>
                    <MapEventManager />
                    <ZoomOverlay />
                    <MapSwitcher />
                    {/* <Menu showSidePanel={true} setShowSidePanel={() => {}} /> */}
                    {/* <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} /> */}
                </Map>
            </div>
            <Footer />
        </div>
    );
}
