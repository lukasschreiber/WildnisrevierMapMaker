import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

interface LayerContextType {
    g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export function LayerProvider({ children }: React.PropsWithChildren) {
    const map = useMap();
    const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

    useEffect(() => {
        console.time("SVG Layer creation");

        const svgLayer = L.svg();
        svgLayer.addTo(map);

        const svg = d3.select(map.getPanes().overlayPane).select<SVGSVGElement>("svg");
        svg.attr("pointer-events", "auto");

        let g = svg.select<SVGGElement>("g.leaflet-overlay");
        if (g.empty()) {
            g = svg.append("g").classed("leaflet-overlay", true).attr("id", "waypoint-overlay");
        }

        gRef.current = g;

        console.timeEnd("SVG Layer creation");

        // Ensure the layer is initialized correctly after the map is ready
        if (map.getZoom() > 0 && !gRef.current) {
            gRef.current = d3.select(map.getPanes().overlayPane).select("g#waypoint-overlay");
        }

        return () => {
            console.log("Cleaning up SVG layer");
            svgLayer.remove();
            gRef.current = null;
        };
    }, [map]);

    return <LayerContext.Provider value={{ g: gRef.current }}>{children}</LayerContext.Provider>;
}

export function useLayer() {
    const context = useContext(LayerContext);
    if (context === undefined) {
        throw new Error("useLayer must be used within a LayerProvider");
    }
    return context;
}
