export enum TileLayerVersion {
    OSM = "osm",
    Voyager = "voyager",
    LightAll = "carto-light",
    DarkAll = "carto-dark",
    Liberty = "liberty",
    DarkMatter = "dark",
}

type TileLayerConfig = {
    name: string;
    url: string;
    attributions?: { name: string; url: string }[];
    type: "raster" | "maplibre-gl";
    maxZoom?: number;
    highlight?: boolean;
};

export const TileLayerConfigs: Record<TileLayerVersion, TileLayerConfig> = {
    osm: {
        name: "OSM",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 18,
        type: "raster",
        attributions: [{ name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" }],
    },
    "carto-light": {
        name: "Carto",
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        maxZoom: 19,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {light_all}", url: "https://carto.com/about-carto" },
        ],
    },
    "carto-dark": {
        name: "Carto Dark",
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        maxZoom: 19,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {dark_all}", url: "https://carto.com/about-carto" },
        ],
    },
    voyager: {
        name: "Voyager",
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        maxZoom: 19,
        type: "raster",
        attributions: [
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {rastertiles/voyager}", url: "https://carto.com/about-carto" },
        ],
    },
    liberty: {
        name: "OFM",
        url: "https://tiles.openfreemap.org/styles/liberty",
        maxZoom: 24,
        type: "maplibre-gl",
        highlight: true,
        attributions: [
            { name: "OpenFreeMap", url: "https://openfreemap.org" },
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {OpenMapTiles}", url: "https://openmaptiles.org/" },
        ],
    },
    dark: {
        name: "OFM Dark",
        url: "https://tiles.openfreemap.org/styles/dark",
        maxZoom: 24,
        type: "maplibre-gl",
        attributions: [
            { name: "OpenFreeMap", url: "https://openfreemap.org" },
            { name: "&copy; {OpenStreetMap} contributors", url: "https://www.openstreetmap.org/copyright" },
            { name: "&copy; {OpenMapTiles}", url: "https://openmaptiles.org/" },
        ],
    },
};
