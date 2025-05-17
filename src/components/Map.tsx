import { useEffect, useRef, useState } from "react";
import "@maplibre/maplibre-gl-leaflet";
import L from "leaflet";
import { MapProvider } from "../context/MapContext";
import useLocalStorage from "../hooks/useLocalStorage";
import { useSettingsStore } from "../stores/useSettings";
import { TileLayerConfigs, TileLayerVersion } from "../utils/tiles";

export interface MapProps {
    maxZoom?: number;
    minZoom?: number;
    maxPanDistanceFromCenter?: number;
    tiles?: TileLayerVersion;
    center?: {
        lat: number;
        lng: number;
    };
    zoom?: number;
}

export function Map({ children, ...props }: React.PropsWithChildren<MapProps>) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const tileLayerRef = useRef<L.Layer | null>(null); // track current tile layer
    const existingMaplibreAttribution = useRef<string | null>(null);

    const [initialized, setInitialized] = useState(false);
    const maxZoom = props.maxZoom ?? useSettingsStore((state) => state.settings.maxZoom);
    const minZoom = props.minZoom ?? 1;
    const mapVersion = props.tiles ?? useSettingsStore((state) => state.settings.mapVersion);
    const [view, setView] = useLocalStorage("view", {
        lat: props.center?.lat ?? 52.52,
        lng: props.center?.lng ?? 13.405,
        zoom: props.zoom ?? 13,
    });

    // Initialize map ONCE after container mounts
    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: false,
            center: [view.lat, view.lng],
            zoom: view.zoom,
        });
        setInitialized(true);

        // Listen for moveend and zoomend to save view
        mapRef.current.on("moveend zoomend", () => {
            const center = mapRef.current!.getCenter();
            const zoom = mapRef.current!.getZoom();
            setView({ lat: center.lat, lng: center.lng, zoom });
        });
    }, [view.lat, view.lng, view.zoom, setView]);

    // Update tile layer when mapVersion or maxZoom changes
    useEffect(() => {
        if (!mapRef.current || !mapVersion || !maxZoom) return;

        const layerConfig = TileLayerConfigs[mapVersion];

        // Remove existing tile layer
        if (tileLayerRef.current) {
            mapRef.current.removeLayer(tileLayerRef.current);
            tileLayerRef.current = null;
        }

        const attribution = layerConfig.attributions
            ?.map((a) => {
                if (a.name.match(/{(.*?)}/g)) {
                    return a.name.replace(/{(.*?)}/g, (_, p1) => `<a href="${a.url}" target="_blank">${p1}</Link>`);
                } else {
                    return `<a href="${a.url}" target="_blank">${a.name}</Link>`;
                }
            })
            .join(", ");

        if (layerConfig.type === "raster") {
            if (existingMaplibreAttribution.current) {
                mapRef.current.attributionControl.removeAttribution(existingMaplibreAttribution.current);
                existingMaplibreAttribution.current = null;
            }
            tileLayerRef.current = L.tileLayer(layerConfig.url, {
                maxNativeZoom: layerConfig.maxZoom,
                maxZoom: maxZoom,
                attribution,
            });
        } else if (layerConfig.type === "maplibre-gl") {
            tileLayerRef.current = L.maplibreGL({
                style: layerConfig.url,
                maxZoom: maxZoom,
            }) as unknown as L.Layer;
            if (attribution) {
                mapRef.current.attributionControl.addAttribution(attribution);
                existingMaplibreAttribution.current = attribution;
            }
        }

        tileLayerRef.current?.addTo(mapRef.current);
    }, [mapVersion, maxZoom]);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.setMaxZoom(maxZoom);
        mapRef.current.setMinZoom(minZoom);
    }, [mapRef.current, maxZoom, minZoom]);

    useEffect(() => {
        if (!mapRef.current || !props.maxPanDistanceFromCenter) return;
        const maxPanDistance = props.maxPanDistanceFromCenter;
        const center = props.center || mapRef.current.getCenter();
        mapRef.current.setMaxBounds([
            [center.lat - maxPanDistance, center.lng - maxPanDistance],
            [center.lat + maxPanDistance, center.lng + maxPanDistance],
        ])
    }, [mapRef.current, props.maxPanDistanceFromCenter, props.center]);

    // Handle container resizing
    useEffect(() => {
        if (!mapRef.current || !mapContainerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            mapRef.current?.invalidateSize();
        });

        resizeObserver.observe(mapContainerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={mapContainerRef} style={{ height: "100vh", width: "100%" }}>
            {initialized && <MapProvider map={mapRef.current!}>{children}</MapProvider>}
        </div>
    );
}
