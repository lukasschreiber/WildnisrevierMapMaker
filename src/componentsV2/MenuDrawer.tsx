import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "../stores/useLayout";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import BadgerIcon from "../assets/icons/badger.svg?react";
import SidebarIcon from "../assets/icons/sidebar.svg?react";
import ShapeIcon from "../assets/icons/shapes.svg?react";
import WaypointIcon from "../assets/icons/location-pin.svg?react";
import PathIcon from "../assets/icons/scribble.svg?react";
import SettingsIcon from "../assets/icons/settings.svg?react";
import GitIcon from "../assets/icons/code-branch.svg?react";
import { useNavigate } from "react-router";

function MenuDrawer() {
    const menuOpen = useLayoutStore((state) => state.menuOpen);
    const setShowMenu = useLayoutStore((state) => state.setShowMenu);
    const showSidebar = useLayoutStore((state) => state.showSidebar);
    const setShowSidebar = useLayoutStore((state) => state.setShowSidebar);
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
                                <label className="flex items-center cursor-pointer relative">
                                    <input
                                        type="checkbox"
                                        className="peer h-4.5 w-4.5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                        id="check"
                                        checked={showSidebar}
                                        onChange={(e) => setShowSidebar(e.target.checked)}
                                    />
                                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            stroke="currentColor"
                                            stroke-width="1"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"
                                            ></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                        </label>
                        <div className="border-t border-gray-300" />
                        <div className="my-4 flex flex-col gap-3">
                            <div className="text-gray-600 text-xs font-bold uppercase">Current Map</div>
                            <MenuItem
                                label="Waypoints"
                                onClick={() => {
                                    navigate("/waypoints");
                                    setShowMenu(false);
                                }}
                                icon={<WaypointIcon className="w-5 h-5" />}
                            />
                            <MenuItem
                                label="Paths"
                                onClick={() => {
                                    navigate("/paths");
                                    setShowMenu(false);
                                }}
                                icon={<PathIcon className="w-5 h-5" />}
                            />
                            <MenuItem
                                label="Shapes"
                                onClick={() => console.log("Shapes clicked")}
                                icon={<ShapeIcon className="w-5 h-5" />}
                            />
                        </div>
                        <div className="border-t border-gray-300" />
                        <div className="my-4 flex flex-col gap-3">
                            <div className="text-gray-600 text-xs font-bold uppercase">General</div>
                            <MenuItem
                                label="Git Integration"
                                onClick={() => console.log("Git Integration clicked")}
                                icon={<GitIcon className="w-5 h-5" />}
                            />
                            <MenuItem
                                label="Settings"
                                onClick={() => console.log("Settings clicked")}
                                icon={<SettingsIcon className="w-5 h-5" />}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MenuItem({ label, onClick, icon }: { label: string; onClick: () => void; icon?: React.ReactNode }) {
    return (
        <button
            className="w-full text-left hover:text-blue-500 focus:outline-none rounded-md cursor-pointer text-md items-center flex flex-row text-gray-600"
            onClick={onClick}
        >
            {icon ? <div className="w-5 h-5 mr-4">{icon}</div> : <div className="inline-block w-5 h-5 mr-4" />}
            {label}
        </button>
    );
}

export default MenuDrawer;
