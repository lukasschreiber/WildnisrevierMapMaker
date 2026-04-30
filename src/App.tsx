import { FileLaunchHandler } from "./FileLaunchHandler";
import { WaypointLayer } from "./renderer/layers/WaypointLayer";
import { LayerProvider } from "./context/LayerContext";
import { MapEventManager } from "./components/MapEventManager";
import { WaypointArrowLayer } from "./renderer/layers/WaypointArrowLayer";
import { ShapeLayer } from "./renderer/layers/ShapeLayer";
import { Map } from "./components/Map";
import { PathLayer } from "./renderer/layers/PathsLayer";
import { Sidebar } from "./components/Sidebar";
import { MapSwitcher } from "./components/MapSwitcher";
import MenuDrawer from "./components/MenuDrawer";
import { Footer } from "./components/Footer";
import { useLayoutStore } from "./stores/useLayout";
import { Outlet } from "react-router";
import { Tooltray } from "./components/Tooltray";
import { useInteractionsStore } from "./stores/useInteractions";
import { TopIsle } from "./components/TopIsle";
import { ZoomOverlay } from "./components/ZoomOverlay";

export default function App() {
    // const [activeTab, setActiveTab] = useLocalStorage("activeTab", "waypoints");
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    const mode = useInteractionsStore((state) => state.mode);

    return (
        <div className={`flex flex-col h-screen ${mode === "waypoint-add" ? "add-mode-active" : ""}`}>
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
                    <Tooltray />
                    <MapSwitcher />
                </Map>
            </div>
            <Footer />
        </div>
    );
}
