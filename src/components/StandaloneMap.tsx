import { LayerProvider } from "../context/LayerContext";
import { Map } from "./Map";
import { TileLayerVersion } from "../utils/tiles";
import { WaypointLayer } from "../renderer/layers/WaypointLayer";
import { WMAPFormatContent } from "../utils/persistence";
import { ShapeLayer } from "../renderer/layers/ShapeLayer";
import { SegmentLayer } from "../renderer/layers/SegmentLayer";

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
    pathWidth?: number;
    pathColor?: string;
    pathOutlineColor?: string;
    pathOutlineWidth?: number;
    pathTension?: number;
    debugging?: boolean;
};

const x = 50.17085202469079;
const y = 8.631960603439982;

export function StandaloneMap(props: StandaloneMapProps) {
    const debugging = props.debugging ?? false;
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
                <SegmentLayer
                    segments={props.file?.segments}
                    waypoints={props.file?.waypoints}
                    pathWidth={props.pathWidth}
                    pathColor={props.pathColor}
                    pathOutlineColor={props.pathOutlineColor}
                    pathOutlineWidth={props.pathOutlineWidth}
                    pathTension={props.pathTension}
                />
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
                />
            </LayerProvider>
        </Map>
    );
}

StandaloneMap.defaultProps = {
    scaleControl: true,
    zoomControl: false,
};
