import { useState } from "react";
import { useSettingsStore } from "../stores/useSettings";
import { TileLayerConfigs, TileLayerVersion } from "../utils/tiles";
import { MapTypePreview } from "./common/MapTypePreview";

export function MapSwitcher() {
    const mapVersion = useSettingsStore((state) => state.settings.mapVersion);
    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <div
            className="absolute bottom-2 left-2 z-1000 flex items-end justify-center gap-4"
            onMouseEnter={() => setOpenDrawer(true)}
            onMouseLeave={() => setOpenDrawer(false)}
        >
            <div className="flex items-center justify-center h-18 w-18 bg-white rounded-md shadow-lg overflow-hidden p-1 cursor-pointer">
                <MapTypePreview map={mapVersion} />
                <div className="absolute bottom-0 left-0 text-center text-gray-800 bg-white p-1 rounded-tr-md z-[1001] text-xs">
                    {TileLayerConfigs[mapVersion].name}
                </div>
            </div>
            {openDrawer && (
                <div className="bg-white h-22 px-2 p-1 rounded-md shadow-lg flex flex-row gap-3 items-center">
                    {Object.entries(TileLayerConfigs).map(([key, config]) => (
                        <div
                            key={key}
                            className={`h-18 w-18 relative cursor-pointer rounded-md hover:outline-2 overflow-hidden outline-offset-2 ${mapVersion === key ? "outline-2 outline-blue-500" : "outline-blue-300 "}`}
                            onClick={() => useSettingsStore.getState().set("mapVersion", key as TileLayerVersion)}
                        >
                            <MapTypePreview map={key as TileLayerVersion} />
                            <div className="absolute bottom-0 left-0 text-center text-gray-800 bg-white p-1 rounded-tr-md z-[1001] text-xs">
                                {config.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
