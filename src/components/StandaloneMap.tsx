import { LayerProvider } from "../context/LayerContext";
import { Map } from "./Map";
import { TileLayerVersion } from "../utils/tiles";
import { WaypointLayer } from "../renderer/layers/WaypointLayer";
import { WMAPFormatContent } from "../utils/persistence";

type StandaloneMapProps = {
    name?: string;
    scaleControl?: boolean;
    zoomControl?: boolean;
    maxZoom?: number;
    tiles?: TileLayerVersion;
    file?: WMAPFormatContent;
};

const x = 50.17085202469079;
const y = 8.631960603439982;

export function StandaloneMap(props: StandaloneMapProps) {
    return (
        <Map center={{ lat: x, lng: y }} zoom={19} maxZoom={props.maxZoom ?? 24} tiles={props.tiles ?? TileLayerVersion.Liberty}>
            <LayerProvider>
                {/* <ShapeLayer /> */}
                {/* <SegmentLayer /> */}
                <WaypointLayer waypoints={props.file?.waypoints} types={props.file?.waypointTypes} groups={props.file?.groups} />
                {/* <WaypointArrowLayer /> */}
            </LayerProvider>
            {/* <MapEventManager /> */}
        </Map>
    );
}

StandaloneMap.defaultProps = {
    scaleControl: true,
    zoomControl: false,
};
