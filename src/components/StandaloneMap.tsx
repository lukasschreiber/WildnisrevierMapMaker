import { LayerProvider } from "../context/LayerContext";
import { Map } from "./Map";
import { TileLayerVersion } from "../utils/tiles";
import { WaypointLayer } from "../renderer/layers/WaypointLayer";
import { WMAPFormatContent } from "../utils/persistence";
import { ShapeLayer } from "../renderer/layers/ShapeLayer";

type StandaloneMapProps = {
    name?: string;
    scaleControl?: boolean;
    zoomControl?: boolean;
    maxZoom?: number;
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
};

const x = 50.17085202469079;
const y = 8.631960603439982;

export function StandaloneMap(props: StandaloneMapProps) {
    return (
        <Map
            center={{ lat: x, lng: y }}
            zoom={19}
            maxZoom={props.maxZoom ?? 24}
            tiles={props.tiles ?? TileLayerVersion.Liberty}
        >
            <LayerProvider>
                <ShapeLayer
                    shapes={props.file?.shapes}
                    waypoints={props.file?.waypoints}
                    shapeLabelColor={props.shapeLabelColor}
                    showSolidBlockBehindLabels={props.showSolidBlockBehindLabels}
                />
                {/* <SegmentLayer /> */}
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
