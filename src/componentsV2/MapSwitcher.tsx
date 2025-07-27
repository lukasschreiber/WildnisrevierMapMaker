import { useState } from "react";
import { useSettingsStore } from "../stores/useSettings";
import { TileLayerConfigs, TileLayerVersion } from "../utils/tiles";
import { MapTypePreview } from "./common/MapTypePreview";
import StarIcon from "../assets/icons/star.svg?react";
import { motion, AnimatePresence } from "framer-motion";
import { DisablePropagation } from "./common/DisablePropagation";

export function MapSwitcher() {
    const mapVersion = useSettingsStore((state) => state.settings.mapVersion);
    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <DisablePropagation
            className="absolute bottom-2 left-4 z-1000 flex items-end justify-center gap-4"
            onMouseEnter={() => setOpenDrawer(true)}
            onMouseLeave={() => setOpenDrawer(false)}
        >
            <div className="flex items-center justify-center h-18 w-18 bg-white rounded-md shadow-lg overflow-hidden p-1 cursor-pointer relative">
                <MapTypePreview map={mapVersion} />
                <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white p-2 pt-2 z-1001 bg-gradient-to-t from-black/50">
                    Maps
                </div>
            </div>
            <AnimatePresence>
                {openDrawer && (
                    <motion.div
                        key="map-drawer"
                        className="bg-white h-22 px-2 p-1 rounded-md shadow-lg flex flex-row gap-3 items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {Object.entries(TileLayerConfigs).map(([key, config]) => (
                            <div
                                key={key}
                                className={`h-18 w-18 relative cursor-pointer rounded-md hover:outline-2 overflow-hidden outline-offset-2 ${mapVersion === key ? "outline-2 outline-blue-500" : "outline-blue-300 "}`}
                                onClick={() => useSettingsStore.getState().set("mapVersion", key as TileLayerVersion)}
                            >
                                {config.highlight && (
                                    <StarIcon className="absolute top-1 right-1 w-5 h-5 text-yellow-500 z-[1001] fill-yellow-300" />
                                )}
                                <MapTypePreview map={key as TileLayerVersion} />
                                <MapTypeName map={key as TileLayerVersion} />
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </DisablePropagation>
    );
}

function MapTypeName({ map }: { map: TileLayerVersion }) {
    const config = TileLayerConfigs[map];
    return (
        <div
            className={`absolute bottom-0 left-0 text-center p-1 rounded-tr-md z-[1001] text-xs ${config.type === "raster" ? "bg-blue-200 text-blue-800" : "bg-green-200 text-green-800"}`}
        >
            {config.name}
        </div>
    );
}
