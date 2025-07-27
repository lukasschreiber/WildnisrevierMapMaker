import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "../stores/useLayout";
import XMarkIcon from "../assets/icons/xmark.svg?react";
import BadgerIcon from "../assets/icons/badger.svg?react";
import SidebarIcon from "../assets/icons/sidebar.svg?react";

function MenuDrawer() {
    const menuOpen = useLayoutStore((state) => state.menuOpen);
    const setShowMenu = useLayoutStore((state) => state.setShowMenu);

    return (
        <AnimatePresence>
            {menuOpen && (
                <motion.div
                    className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-4 z-[10000] text-gray-800"
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
                    <label className="flex items-center mb-4 cursor-pointer text-gray-600">
                        <SidebarIcon className="w-6 h-6 mr-4" />
                        Show Sidebar
                        <div className="inline-flex items-center ml-auto">
                            <label className="flex items-center cursor-pointer relative">
                                <input
                                    type="checkbox"
                                    className="peer h-4.5 w-4.5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                    id="check"
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default MenuDrawer;
