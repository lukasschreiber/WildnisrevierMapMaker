import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import * as d3 from "d3";
import { LayerContext } from "./useLayer";
import { useMap } from "./useMap";

type GMap = Map<number, d3.Selection<SVGGElement, unknown, null, undefined>>;

export function LayerProvider({ children }: React.PropsWithChildren) {
    const map = useMap();
    const layerRef = useRef<L.SVG | null>(null);
    const gMapRef = useRef<GMap>(new Map());
    const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
    const [isSvgReady, setSvgReady] = useState(false);

    useEffect(() => {
        const svgLayer = L.svg();

        svgLayer.addTo(map);

        layerRef.current = svgLayer;
        const gMap = gMapRef.current;

        const svg = d3.select(map.getPanes().overlayPane).select<SVGSVGElement>("svg");
        svg.attr("pointer-events", "auto");
        svgRef.current = svg;
        setSvgReady(true);

        const updateLayerOrder = () => {
            const gs = Array.from(gMap.entries()).sort(([a], [b]) => a - b);
            gs.forEach(([, g]) => {
                svg.node()?.appendChild(g.node()!);
            });
        };

        updateLayerOrder();

        return () => {
            svgLayer.remove();
            gMap.clear();
            svgRef.current = null;
            setSvgReady(false);
        };
    }, [map]);

    const getLayer = useCallback((zIndex: number) => {
        const svg = svgRef.current;
        if (!svg) return null;

        if (gMapRef.current.has(zIndex)) {
            return gMapRef.current.get(zIndex)!;
        }

        const g = svg
            .append("g")
            .classed("leaflet-overlay", true)
            .classed("waypoint-overlay", true)
            .attr("data-z", zIndex)
            .attr("id", `overlay-z-${zIndex}`);

        gMapRef.current.set(zIndex, g);

        const sorted = Array.from(gMapRef.current.entries()).sort(([a], [b]) => a - b);
        sorted.forEach(([, layer]) => svg.node()?.appendChild(layer.node()!));

        return g;
    }, []);

    useEffect(() => {
        if (!layerRef.current) return;

        function handleMove(ev: L.LeafletEvent) {
            layerRef.current?.getEvents?.().moveend?.call(layerRef.current, ev);
        }

        map.on("move", handleMove);

        return () => {
            map.off("move", handleMove);
        }
    }, [isSvgReady, map]);

    return <LayerContext.Provider value={{ getLayer }}>{isSvgReady && children}</LayerContext.Provider>;
}
