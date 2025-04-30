import { Marker } from "react-leaflet";
import { useWaypointStore } from "../stores/useWaypoints";

export function LocationMarker() {
    const currentPosition = useWaypointStore((state) => state.currentPosition);

    return currentPosition === null ? null : (
        <Marker position={currentPosition}></Marker>
    );
}
