import { useCallback, useEffect } from "react";
import { useLayer } from "../../context/LayerContext";
import { renderSegments } from "../renderSegments";
import { useSettings } from "../../settings/useSettings";
import { useMap } from "react-leaflet";
import { usePathContext } from "../../context/PathContext";
import { useWaypointContext } from "../../context/WaypointContext";

export function SegmentLayer() {
    const { registerLayerRedrawFn } = useLayer();
    const { segments, selectSegment } = usePathContext();
    const { getWaypointById } = useWaypointContext();
    const map = useMap();
    const { settings } = useSettings();

    const draw = useCallback((g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
        renderSegments(
            g,
            map,
            segments,
            getWaypointById,
            settings.showSinglePaths,
            settings.pathWidth,
            settings.pathColor,
            settings.hideOriginalPaths,
            settings.hideFancyPaths,
            settings.pathTension,
            selectSegment
        );

        return g;
    }, [
        segments,
        map,
        settings.showSinglePaths,
        settings.pathWidth,
        settings.pathColor,
        settings.hideOriginalPaths,
        settings.hideFancyPaths,
        settings.pathTension,
        selectSegment,
    ]);

    useEffect(() => {
        registerLayerRedrawFn("segment-layer", draw);
    }, [draw]);

    return null;
}