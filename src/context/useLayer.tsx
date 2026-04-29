import { createContext, useContext } from "react";

export interface LayerContextType {
    getLayer: (zIndex: number) => d3.Selection<SVGGElement, unknown, null, undefined> | null;
}

export const LayerContext = createContext<LayerContextType | undefined>(undefined);

export function useLayer(zIndex: number) {
    const context = useContext(LayerContext);
    if (context === undefined) {
        throw new Error("useLayer must be used within a LayerProvider");
    }
    return context.getLayer(zIndex);
}
