import MenuIcon from "../assets/icons/menu.svg?react";
import WaypointIcon from "../assets/icons/location-pin.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";
import { useNavigate } from "react-router";
import { panels } from "../panels";

export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const navigate = useNavigate();
    const pinnedPanels = useLayoutStore((state) => state.pinnedSidebarItems);

    return (
        <DisablePropagation className="h-full w-24 bg-white text-gray-800 flex flex-col gap-1 z-[10005]">
            <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => toggleMenu()}>
                <MenuIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-center justify-center mt-4 gap-4">
                {panels
                    .flatMap((group) => group.panels)
                    .filter(panel => pinnedPanels.includes(panel.path))
                    .map((panel) => (
                        <div
                            className="flex flex-col items-center justify-center cursor-pointer text-gray-600 hover:text-blue-500 w-full"
                            onClick={() => navigate(panel.path)}
                        >
                            {<panel.icon className="w-6 h-6" />}
                            <div className="text-xs max-w-16 text-center">{panel.title}</div>
                        </div>
                    ))}
            </div>
        </DisablePropagation>
    );
}
