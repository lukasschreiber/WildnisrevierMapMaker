import { createContext, RefObject, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

interface LayerContextType {
    g: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
    registerLayerRedrawFn: (
        name: string,
        drawFn: (g: d3.Selection<SVGGElement, unknown, null, undefined>) => d3.Selection<SVGGElement, unknown, null, undefined>
    ) => void;
    redraw: () => void;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export function LayerProvider({ children }: React.PropsWithChildren) {
    const map = useMap();
    const svgRef = useRef<L.SVG>(null);
    const d3SvgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
    const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

    const [layerDrawFunctions, setLayerDrawFunctions] = useState<
        Map<string, (g: d3.Selection<SVGGElement, unknown, null, undefined>) => d3.Selection<SVGGElement, unknown, null, undefined>>
    >(new Map());

    useEffect(() => {
        console.time("SVG Layer creation");

        const svgLayer = L.svg();
        svgLayer.addTo(map);
        svgRef.current = svgLayer;

        const svg = d3.select(map.getPanes().overlayPane).select<SVGSVGElement>("svg");
        svg.attr("pointer-events", "auto");

        let g = svg.select<SVGGElement>("g.leaflet-overlay");
        if (g.empty()) {
            g = svg.append("g")
                .classed("leaflet-overlay", true)
                .attr("id", "waypoint-overlay");
        }

        d3SvgRef.current = svg;
        gRef.current = g;

        redrawLayers(); // Initial draw of layers
        console.timeEnd("SVG Layer creation");

        return () => {
            console.log("Cleaning up SVG layer");
            svgLayer.remove();
            svgRef.current = null;
            d3SvgRef.current = null;
            gRef.current = null;
        };
    }, [map]);

    const redrawLayers = useCallback(() => {
        const g = gRef.current;
        if (!g) return;

        g.selectAll("*").remove();
        layerDrawFunctions.forEach((drawFn) => drawFn(g));
    }, [layerDrawFunctions]);

    useEffect(() => {
        map.on("zoomend moveend", redrawLayers);
        return () => {
            map.off("zoomend moveend", redrawLayers);
        };
    }, [map, redrawLayers]);

    const handleResize = useCallback(() => {
        const svg = d3SvgRef.current;
        if (!svg) return;
        svg.style("border", "2px solid red");

        // const zoom = map.getZoom();
        // const center = map.getCenter();
        // const scale = map.getZoomScale(zoom);
        // const mapSize = map.getSize();

        // const bounds = svg.node()?.getBBox();
        // if (!bounds) return;

        // console.log(center)

        // const topLeft = map.latLngToLayerPoint(center).subtract(
        //     L.point(mapSize.x / 2, mapSize.y / 2)
        // )

        // console.log(topLeft)

        // L.DomUtil.setTransform(svg.node() as unknown as HTMLElement, topLeft, scale);
    }, [map]);

    useEffect(() => {
        map.on("viewreset move zoom", handleResize);
        return () => {
            map.off("viewreset move zoom", handleResize);
        };
    }, [map, handleResize]);

    const registerLayerRedrawFn = useCallback(
        (name: string, drawFn: (g: d3.Selection<SVGGElement, unknown, null, undefined>) => d3.Selection<SVGGElement, unknown, null, undefined>) => {
            setLayerDrawFunctions((prev) => {
                const updated = new Map(prev);
                updated.set(name, drawFn);
                return updated;
            });
        },
        []
    );

    return (
        <LayerContext.Provider value={{ g: gRef, registerLayerRedrawFn, redraw: redrawLayers }}>
            {children}
        </LayerContext.Provider>
    );
}

// Hook
export function useLayer() {
    const context = useContext(LayerContext);
    if (!context) {
        throw new Error("useLayer must be used within a LayerProvider");
    }
    return context;
}
