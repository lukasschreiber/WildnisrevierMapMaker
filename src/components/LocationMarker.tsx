import { Marker } from "react-leaflet";
import { useWaypointContext } from "../context/WaypointContext";

export function LocationMarker() {
    const { currentPosition } = useWaypointContext();

    return currentPosition === null ? null : (
        <Marker position={currentPosition}></Marker>
    );
}
