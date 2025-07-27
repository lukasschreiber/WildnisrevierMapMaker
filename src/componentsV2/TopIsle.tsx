import { useLocation, useNavigate } from "react-router";
import MenuIcon from "../assets/icons/menu.svg?react";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";

interface TopIsleProps {}

export function TopIsle({}: TopIsleProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    const location = useLocation();
    const navigate = useNavigate();

    const isPanelVisible = location.pathname !== "/";

    return (
        <DisablePropagation>
            <div className={`flex flex-col items-center absolute top-0 z-[1003]`}>
                <div className={`bg-white rounded-full px-4 min-w-64 m-4 flex flex-row items-center py-2 justify-between border ${isPanelVisible ? "border-gray-200 " : "shadow-lg border-white"}`}>
                    <div className="flex items-center flex-row gap-2 w-full">
                        {!showSidebar && (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer text-gray-600"
                                onClick={() => toggleMenu()}
                            >
                                <MenuIcon className="w-6 h-6" />
                            </div>
                        )}
                        <div className="text-sm text-gray-500">Test</div>
                        {isPanelVisible && (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer text-gray-600 ml-auto"
                                onClick={() => navigate("/")}
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DisablePropagation>
    );
}
