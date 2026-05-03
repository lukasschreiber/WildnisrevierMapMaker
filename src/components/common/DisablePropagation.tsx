import { HTMLProps, useEffect, useRef } from "react";
import L from "leaflet";

export function DisablePropagation({ className, ...props }: HTMLProps<HTMLDivElement>) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
        }
    }, []);

    return <div ref={containerRef} className={`${className} cursor-default`} {...props} />;
}
