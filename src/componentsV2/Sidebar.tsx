import MenuIcon from "../assets/icons/menu.svg?react";
import WaypointIcon from "../assets/icons/location-pin.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";
import { useNavigate } from "react-router";

export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const navigate = useNavigate();
    return (
        <DisablePropagation className="h-full w-24 bg-white text-gray-800 flex flex-col gap-1 z-[10005]">
            <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => toggleMenu()}>
                <MenuIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
                <div
                    className="flex flex-col items-center justify-center cursor-pointer text-gray-600 hover:text-blue-500"
                    onClick={() => navigate("/waypoints")}
                >
                    <WaypointIcon className="w-6 h-6" />
                    <div className="text-xs">Waypoints</div>
                </div>
            </div>
        </DisablePropagation>
    );
}
