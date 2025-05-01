import { createContext, useContext, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

type GMap = Map<number, d3.Selection<SVGGElement, unknown, null, undefined>>;

interface LayerContextType {
    getLayer: (zIndex: number) => d3.Selection<SVGGElement, unknown, null, undefined> | null;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export function LayerProvider({ children }: React.PropsWithChildren) {
    const map = useMap();
    const gMapRef = useRef<GMap>(new Map());

    useEffect(() => {
        const svgLayer = L.svg();
        svgLayer.addTo(map);

        const svg = d3.select(map.getPanes().overlayPane).select<SVGSVGElement>("svg");
        svg.attr("pointer-events", "auto");

        // Optional: sort layers by zIndex when DOM updates happen
        const updateLayerOrder = () => {
            const gs = Array.from(gMapRef.current.entries()).sort(([a], [b]) => a - b);
            gs.forEach(([_, g]) => {
                svg.node()?.appendChild(g.node()!);
            });
        };

        // Initial layer order (though initially empty)
        updateLayerOrder();

        return () => {
            svgLayer.remove();
            gMapRef.current.clear();
        };
    }, [map]);

    const getLayer = (zIndex: number) => {
        if (gMapRef.current.has(zIndex)) {
            return gMapRef.current.get(zIndex)!;
        }

        const svg = d3.select(map.getPanes().overlayPane).select<SVGSVGElement>("svg");
        if (svg.empty()) return null;

        const g = svg.append("g")
            .classed("leaflet-overlay", true)
            .attr("data-z", zIndex)
            .attr("id", `overlay-z-${zIndex}`);

        gMapRef.current.set(zIndex, g);

        // Optional: re-sort layers after creation
        const sorted = Array.from(gMapRef.current.entries()).sort(([a], [b]) => a - b);
        sorted.forEach(([_, layer]) => svg.node()?.appendChild(layer.node()!));

        return g;
    };

    return (
        <LayerContext.Provider value={{ getLayer }}>
            {children}
        </LayerContext.Provider>
    );
}

export function useLayer(zIndex: number) {
    const context = useContext(LayerContext);
    if (context === undefined) {
        throw new Error("useLayer must be used within a LayerProvider");
    }
    return context.getLayer(zIndex);
}
