import { LayerProvider } from "../context/LayerContext";
import { Map } from "./Map";
import { TileLayerVersion } from "../utils/tiles";
import { WaypointLayer } from "../renderer/layers/WaypointLayer";
import { WMAPFormatContent } from "../utils/persistence";
import { ShapeLayer } from "../renderer/layers/ShapeLayer";
import { StandaloneMapEventManager } from "./StandaloneMapEventManager";
import { WaypointType } from "../stores/useWaypointTypes";
import L from "leaflet";
import { ReactNode, useCallback, useEffect } from "react";
import { PathLayer } from "../renderer/layers/PathsLayer";
import { Waypoint } from "../stores/useWaypoints";
import { createPortal } from "react-dom";
import { useMapContext } from "../context/useMap";

type StandaloneMapProps = {
    name?: string;
    scaleControl?: boolean;
    zoomControl?: boolean;
    maxZoom?: number;
    minZoom?: number;
    maxPanDistanceFromCenter?: number;
    tiles?: TileLayerVersion;
    file?: WMAPFormatContent;
    borderWidth?: number;
    radius?: number;
    borderColor?: string;
    showBorder?: boolean;
    showLabels?: boolean;
    labelColor?: string;
    shapeLabelColor?: string;
    showSolidBlockBehindLabels?: boolean;
    debugging?: boolean;
    labelRenderer?: Record<number, (waypoint: Waypoint, type: WaypointType) => ReactNode>;
};

const x = 50.17073552662087;
const y = 8.63193034819791;

export function StandaloneMap(props: StandaloneMapProps) {
    const debugging = props.debugging ?? false;
    if (!props.file) {
        console.error("StandaloneMap: No file provided");
        return null;
    }

    return (
        <Map
            center={{ lat: x, lng: y }}
            zoom={19}
            maxPanDistanceFromCenter={props.maxPanDistanceFromCenter ?? 0.003}
            maxZoom={props.maxZoom ?? 24}
            minZoom={props.minZoom ?? 1}
            tiles={props.tiles ?? TileLayerVersion.Liberty}
        >
            <LayerProvider>
                <ShapeLayer
                    shapes={props.file?.shapes}
                    waypoints={props.file?.waypoints}
                    shapeLabelColor={props.shapeLabelColor}
                    showSolidBlockBehindLabels={props.showSolidBlockBehindLabels}
                    debugging={debugging}
                />
                <PathLayer paths={props.file?.paths} waypoints={props.file?.waypoints} debugging={debugging} />
                <WaypointLayer
                    waypoints={props.file?.waypoints}
                    types={props.file?.waypointTypes}
                    groups={props.file?.groups}
                    disableSelection
                    visualizeHiddenItems={false}
                    borderWidth={props.borderWidth}
                    radius={props.radius}
                    borderColor={props.borderColor}
                    showBorder={props.showBorder}
                    showLabels={props.showLabels}
                    labelColor={props.labelColor}
                    highlightType={true}
                />
            </LayerProvider>
            <SelectedWaypointLabel
                types={props.file?.waypointTypes || {}}
                radius={props.radius}
                labelRenderer={props.labelRenderer}
            />
            <StandaloneMapEventManager />
        </Map>
    );
}

StandaloneMap.defaultProps = {
    scaleControl: true,
    zoomControl: false,
};

function SelectedWaypointLabel(props: {
    types: Record<number, WaypointType>;
    radius?: number;
    labelRenderer?: Record<number, (waypoint: Waypoint, type: WaypointType) => ReactNode>;
}) {
    const { selectedWaypoint, map } = useMapContext();

    const type = selectedWaypoint ? props.types[selectedWaypoint.typeId] : undefined;

    const updatePosition = useCallback(() => {
        if (!selectedWaypoint) return;
        const point = map.latLngToContainerPoint(new L.LatLng(selectedWaypoint.lat, selectedWaypoint.lng));
        const offset = type?.radiusOverride ?? props.radius ?? 10;
        const label = document.getElementById("standalone-label");
        if (label) {
            label.style.transform = `translate(${point.x + offset + 5}px, ${point.y - 15}px)`;
        }
    }, [map, props.radius, selectedWaypoint, type?.radiusOverride]);

    useEffect(() => {
        map.on("move zoom zoomanim", updatePosition);

        return () => {
            map.off("move zoom zoomanim", updatePosition);
        };
    }, [map, selectedWaypoint, updatePosition]);

    useEffect(() => {
        updatePosition();
    }, [updatePosition]);

    if (!selectedWaypoint || !type) return null;

    return createPortal(
        <div
            className="absolute top-0 left-0 bg-white dark:bg-gray-700 dark:text-gray-50 p-1 rounded shadow z-[10000] pointer-events-auto"
            id="standalone-label"
            onClick={() => {
                console.log("Label clicked:", selectedWaypoint);
                // You can also invoke a prop callback here
            }}
        >
            {props.labelRenderer && props.labelRenderer[Number(selectedWaypoint.typeId)] ? (
                props.labelRenderer[Number(selectedWaypoint.typeId)](selectedWaypoint, type)
            ) : (
                <>
                    <h2 className="text-sm font-bold">{type.name}</h2>
                    <p className="text-xs text-gray-500">{selectedWaypoint.name}</p>
                </>
            )}
        </div>,
        document.body
    );
}
