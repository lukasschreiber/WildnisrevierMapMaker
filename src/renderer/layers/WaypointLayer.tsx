import React from "react";
import { useLayer } from "../../context/LayerContext";
import { useWaypointStore } from "../../stores/useWaypoints";
import { Waypoint } from "../elements/Waypoint";
import { WaypointLabel } from "../elements/WaypointLabel";

export function WaypointLayer() {
    const { g } = useLayer();
    const waypoints = useWaypointStore((state) => state.waypoints);

    return waypoints.map((waypoint) => (
        <React.Fragment key={waypoint.id}>
            <Waypoint g={g} waypointId={waypoint.id} />
            <WaypointLabel g={g} waypointId={waypoint.id} />
        </React.Fragment>
    ));
}

// const draw = useCallback((g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
//     waypoints.forEach(({ lat, lng, id, baseId, name, typeId, groupId }) => {
//         const point = map.latLngToLayerPoint(new L.LatLng(lat, lng));
//         const isSelected = id === selectedId;

//         if (baseId !== undefined) {
//             const baseWaypoint = getWaypointById(baseId)!;

//             const basePoint = map.latLngToLayerPoint(new L.LatLng(baseWaypoint.lat, baseWaypoint.lng));
//             const dist = haversineDistance(lat, lng, baseWaypoint.lat, baseWaypoint.lng);

//             if (settings.showWaypointLines) {
//                 renderWaypointArrow(
//                     g,
//                     point,
//                     basePoint,
//                     settings.waypointRadius,
//                     settings.arrowColor,
//                     settings.arrowSize,
//                     settings.arrowWidth,
//                     settings.arrowOpacity
//                 );
//             }

//             if (settings.showWaypointDistances) {
//                 renderLabel(
//                     g,
//                     (point.x + basePoint.x) / 2,
//                     (point.y + basePoint.y) / 2 - 5,
//                     `${dist.toFixed(2)} m`,
//                     "distance-label",
//                     settings.labelColor
//                 );
//             }
//         }

//     });
