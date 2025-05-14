export enum TileLayerVersion {
    OSM = "osm",
    Voyager = "voyager",
    LightAll = "carto-light",
    DarkAll = "carto-dark",
    Liberty = "liberty",
}

type TileLayerConfig = {
    url: string;
    attributions?: { name: string; url: string }[];
    type: "raster" | "maplibre-gl";
    maxZoom?: number;
};

export const TileLayerConfigs: Record<TileLayerVersion, TileLayerConfig> = {
    osm: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 18,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
        ],
    },
    "carto-light": {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        maxZoom: 19,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {light_all}", url: "https://carto.com/about-carto" },
        ],
    },
    "carto-dark": {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        maxZoom: 19,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {dark_all}", url: "https://carto.com/about-carto" },
        ],
    },
    voyager: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        maxZoom: 19,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {rastertiles/voyager}", url: "https://carto.com/about-carto" },
        ],
    },
    liberty: {
        url: "https://tiles.openfreemap.org/styles/liberty",
        maxZoom: 24,
        type: "maplibre-gl",
        attributions: [
            { name: "OpenFreeMap", url: "https://openfreemap.org" },
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {OpenMapTiles}", url: "https://openmaptiles.org/" },
        ],
    },
};
