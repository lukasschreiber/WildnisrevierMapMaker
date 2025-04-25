import { useMap, useMapEvents } from "react-leaflet";

export function MapPersister({ setView }: { setView: (view: { lat: number; lng: number; zoom: number }) => void }) {
    const map = useMap();

    useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            setView({ lat: center.lat, lng: center.lng, zoom });
        },
    });

    return null;
}
