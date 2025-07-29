import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "../stores/useLayout";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import BadgerIcon from "../assets/icons/badger.svg?react";
import SidebarIcon from "../assets/icons/sidebar.svg?react";
import PinIcon from "../assets/icons/thumbtack.svg?react";
import { useNavigate } from "react-router";
import { panels } from "../panels";
import { Checkbox } from "./controls/Checkbox";

function MenuDrawer() {
    const menuOpen = useLayoutStore((state) => state.menuOpen);
    const setShowMenu = useLayoutStore((state) => state.setShowMenu);
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    const setShowSidebar = useLayoutStore((state) => state.setShowSidebar);
    const pinnedPanels = useLayoutStore((state) => state.pinnedSidebarItems);
    const pinPanel = useLayoutStore((state) => state.pinSidebarItem);
    const unpinPanel = useLayoutStore((state) => state.unpinSidebarItem);
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {menuOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-[10010]"
                        onClick={() => setShowMenu(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.div
                        className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-4 z-[10011] text-gray-800"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                    >
                        <h2 className="text-xl font-bold mb-6">
                            <BadgerIcon className="inline-block w-8 h-8 mr-2" />
                            MapMaker
                        </h2>
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
                            onClick={() => setShowMenu(false)}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <label className="flex items-center text-md mb-4 cursor-pointer text-gray-600">
                            <SidebarIcon className="w-5 h-5 mr-4" />
                            Show Sidebar
                            <div className="inline-flex items-center ml-auto">
                                <Checkbox checked={showSidebar} onChange={(e) => setShowSidebar((e.target as HTMLInputElement).checked)} />
                            </div>
                        </label>
                        <div className="border-t border-gray-300" />
                        {panels.map((group, index, array) => (
                            <div className="my-4 flex flex-col gap-3">
                                <div className="text-gray-600 text-xs font-bold uppercase">{group.title}</div>
                                {group.panels.map((panel) => (
                                    <MenuItem
                                        key={panel.path}
                                        label={panel.title}
                                        onClick={() => {
                                            navigate(panel.path);
                                            setShowMenu(false);
                                        }}
                                        pinnable={panel.pinnable}
                                        icon={<panel.icon className="w-5 h-5" />}
                                        pinned={pinnedPanels.includes(panel.path)}
                                        onPinClick={() => {
                                            if (pinnedPanels.includes(panel.path)) {
                                                unpinPanel(panel.path);
                                            } else {
                                                pinPanel(panel.path);
                                            }
                                        }}
                                    />
                                ))}
                                {index < array.length - 1 && <div className="border-t border-gray-300" />}
                            </div>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MenuItem({
    label,
    onClick,
    icon,
    pinnable,
    pinned,
    onPinClick,
}: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    pinnable?: boolean;
    pinned?: boolean;
    onPinClick?: () => void;
}) {
    return (
        <button
            className="w-full text-left hover:text-blue-500 focus:outline-none rounded-md cursor-pointer text-md items-center flex flex-row text-gray-600 group"
            onClick={onClick}
        >
            {icon ? <div className="w-5 h-5 mr-4">{icon}</div> : <div className="inline-block w-5 h-5 mr-4" />}
            {label}
            {pinnable && (
                <button
                    className={`ml-auto hover:text-gray-800 cursor-pointer ${!pinned ? "group-hover:block hidden text-gray-600" : "text-gray-800"}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPinClick?.();
                    }}
                >
                    <PinIcon className={`w-4.5 h-4.5 ${pinned && "fill-gray-800 hover:fill-gray-900 hover:text-gray-900"}`} />
                </button>
            )}
        </button>
    );
}

export default MenuDrawer;
