import MenuIcon from "../assets/icons/menu.svg?react";
import { useLayoutStore } from "../stores/useLayout";
import { Link } from "./common/Link";

export interface SidebarProps {}

export function Sidebar(props: SidebarProps) {
    const toggleMenu = useLayoutStore((state) => state.toggleMenu);
    return (
        <div className="h-full w-24 bg-white text-gray-800 flex flex-col gap-1">
            <div className="flex flex-col items-center justify-center py-4 cursor-pointer" onClick={() => toggleMenu()}>
                <MenuIcon className="w-6 h-6" />
            </div>
            <div className="mt-auto mb-2 text-xs mx-2 border-t border-gray-300 pt-1 text-center flex flex-col gap-0.5">
                <Link href="">Imprint</Link>
                <Link href="">Privacy Policy</Link>
                <div className="text-gray-400">v. 1.0.0</div>
            </div>
        </div>
    );
}
