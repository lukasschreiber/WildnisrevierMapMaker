import { SearchMinusLinear, SearchPlusLinear } from "@lukasschreiber/icons";
import { DisablePropagation } from "./common/DisablePropagation";
import { useMap } from "../context/useMap";

export function ZoomOverlay() {
    const map = useMap();
    return (
        <DisablePropagation className="absolute bottom-4 right-0 m-4 flex flex-col z-1000 rounded-md overflow-hidden shadow-lg text-gray-900">
            <button
                className="bg-white p-2 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!map || map.getZoom() >= map.getMaxZoom()}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (map) {
                        map.zoomIn();
                    }
                }}
            >
                <SearchPlusLinear className="w-4 h-4" />
            </button>
            <div className="border-t border-gray-200" />
            <button
                className="bg-white p-2 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!map || map.getZoom() <= map.getMinZoom()}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (map) {
                        map.zoomOut();
                    }
                }}
            >
                <SearchMinusLinear className="w-4 h-4" />
            </button>
        </DisablePropagation>
    );
}
