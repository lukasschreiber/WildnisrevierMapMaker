import MenuIcon from "../assets/icons/menu.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { DisablePropagation } from "./common/DisablePropagation";

interface TopIsleProps {}

export function TopIsle({}: TopIsleProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    return (
        <DisablePropagation>
            <div className={`flex flex-col items-center absolute top-0 z-[1003]`}>
                <div className="bg-white shadow-lg rounded-full px-4 py-3 min-w-64 m-4 flex flex-row items-center justify-between">
                    <div className="flex items-center flex-row gap-2">
                        {!showSidebar && (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer"
                                onClick={() => toggleMenu()}
                            >
                                <MenuIcon className="w-6 h-6" />
                            </div>
                        )}
                        <div className="text-sm text-gray-500">Test</div>
                    </div>
                </div>
            </div>
        </DisablePropagation>
    );
}
