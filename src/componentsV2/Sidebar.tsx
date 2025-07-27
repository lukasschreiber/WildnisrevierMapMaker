import MenuIcon from "../assets/icons/menu.svg?react";
import { useLayoutStore } from "../stores/useLayout";

export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    return (
        <div className="h-full w-24 bg-white text-gray-800 flex flex-col gap-1">
            <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => toggleMenu()}>
                <MenuIcon className="w-6 h-6" />
            </div>
        </div>
    );
}
