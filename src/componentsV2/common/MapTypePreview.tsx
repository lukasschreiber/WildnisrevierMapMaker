import { useEffect, useRef } from "react";
import { TileLayerConfigs, TileLayerVersion } from "../../utils/tiles";
import L from "leaflet";
import { useLayoutStore } from "../../stores/useLayout";

interface MapTypePreviewProps {
    map: TileLayerVersion;
    className?: string;
}

function getZoomForPreview(zoom: number): number {
    if (zoom <= 1) return 1;
    if (zoom > 10) return Math.max(zoom - 3, 1);
    return zoom
}

export function MapTypePreview({ map }: MapTypePreviewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.Layer | null>(null); // track current tile layer
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const center = useLayoutStore((state) => state.mapView.center);
    const zoom = useLayoutStore((state) => state.mapView.zoom);

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: false,
            center,
            zoom: getZoomForPreview(zoom),
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
        });
    }, [center, zoom]);

    useEffect(() => {
        if (!mapRef.current) return;
        mapRef.current.setView(center, getZoomForPreview(zoom));
    }, [center, zoom]);

    useEffect(() => {
        if (!mapRef.current || !map) return;

        const layerConfig = TileLayerConfigs[map];

        // Remove existing tile layer
        if (tileLayerRef.current) {
            mapRef.current.removeLayer(tileLayerRef.current);
            tileLayerRef.current = null;
        }

        if (layerConfig.type === "raster") {
            tileLayerRef.current = L.tileLayer(layerConfig.url, {
                maxNativeZoom: layerConfig.maxZoom,
            });
        } else if (layerConfig.type === "maplibre-gl") {
            tileLayerRef.current = L.maplibreGL({
                style: layerConfig.url,
            }) as unknown as L.Layer;
        }

        tileLayerRef.current?.addTo(mapRef.current);
    }, [map]);

    return <div ref={mapContainerRef} className={`w-full h-full ${map ? "rounded-md shadow-lg" : ""}`}></div>;
}
