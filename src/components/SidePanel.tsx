import { useEffect, useRef } from "react";
import L from "leaflet";
import { SettingsPanel } from "./panels/SettingsPanel";
import { WaypointTypesPanel } from "./panels/WaypointTypesPanel";
import { IOPanel } from "./panels/IOPanel";
import { WaypointsPanel } from "./panels/WaypointsPanel";
import { WaypointGroupsPanel } from "./panels/WaypointGroupsPanel";
import { ShapesPanel } from "./panels/ShapesPanel";
import { PathsPanel } from "./panels/PathsPanel";

export function SidePanel({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
            L.DomEvent.addListener(containerRef.current, "wheel", L.DomEvent.stopPropagation);
        }
    }, [containerRef.current]);

    return (
        <div
            className="absolute top-0 right-0 p-2 text-white bg-black/50 z-[100000] text-xs flex flex-col gap-3 h-full"
            ref={containerRef}
        >
            <div>
                {/* tabs */}
                <div className="flex flex-row gap-2 w-full justify-end">
                    <button
                        className={`p-2 rounded-md ${activeTab === "types" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("types")}
                    >
                        Waypoint Types
                    </button>
                    <button
                        className={`p-2 rounded-md ${activeTab === "waypoints" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("waypoints")}
                    >
                        Waypoints
                    </button>
                    <button
                        className={`p-2 rounded-md ${activeTab === "groups" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("groups")}
                    >
                        Waypoint Groups
                    </button>
                    <button
                        className={`p-2 rounded-md ${activeTab === "shapes" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("shapes")}
                    >
                        Shapes
                    </button>
                    <button
                        className={`p-2 rounded-md ${activeTab === "paths" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("paths")}
                    >
                        Paths
                    </button>
                    <button
                        className={`p-2 rounded-md ${activeTab === "settings" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        Settings
                    </button>
                    <button
                        className={`p-2 rounded-md ${activeTab === "io" ? "bg-blue-500" : ""}`}
                        onClick={() => setActiveTab("io")}
                    >
                        I/O
                    </button>
                </div>
            </div>
            <div className="overflow-auto">
                {activeTab === "settings" && <SettingsPanel />}
                {activeTab === "types" && <WaypointTypesPanel />}
                {activeTab === "io" && <IOPanel />}
                {activeTab === "waypoints" && <WaypointsPanel />}
                {activeTab === "groups" && <WaypointGroupsPanel />}
                {activeTab === "shapes" && <ShapesPanel />}
                {activeTab === "paths" && <PathsPanel />}
            </div>
        </div>
    );
}
