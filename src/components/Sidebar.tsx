import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";
import { useLocation, useNavigate } from "react-router";
import Tooltip from "./common/Tooltip";
import { usePanels } from "../panels";
import { MenuLinear } from "@lukasschreiber/icons";

export function Sidebar() {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const navigate = useNavigate();
    const location = useLocation();
    const pinnedPanels = useLayoutStore((state) => state.pinnedSidebarItems);
    const panels = usePanels();

    return (
        <DisablePropagation className="h-full w-12 bg-white text-gray-800 flex flex-col gap-1 z-[10005]">
            <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => toggleMenu()}>
                <MenuLinear className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
                {panels
                    .flatMap((group) => group.panels)
                    .filter((panel) => pinnedPanels.includes(panel.path))
                    .map((panel) => (
                        <div
                            className={`flex flex-col relative items-center justify-center cursor-pointer text-gray-700 w-full h-10 border-x-3 border-transparent ${location.pathname.includes(panel.path) ? "border-l-blue-500" : ""}`}
                            onClick={() => {
                                navigate(panel.path);
                            }}
                        >
                            <Tooltip key={panel.path} text={panel.title} position="right">
                                {<panel.icon className="w-6 h-6" />}
                                {panel.count !== undefined && panel.count > 0 && (
                                    <div className="absolute right-1 bottom-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[6pt] flex items-center justify-center">
                                        {Math.min(panel.count, 99)}
                                    </div>
                                )}
                            </Tooltip>
                        </div>
                    ))}
            </div>
        </DisablePropagation>
    );
}
