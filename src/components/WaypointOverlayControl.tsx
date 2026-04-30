import { useEffect, useState } from "react";
import { useMap } from "../context/useMap";
import { useInteractionsStore } from "../stores/useInteractions";
import { Waypoint } from "../stores/useWaypoints";
import { DisablePropagation } from "./common/DisablePropagation";
import { NumberInput } from "./controls/NumberInput";
import { IconButton } from "./controls/IconButton";
import { CheckLinear } from "@lukasschreiber/icons";

export function WaypointOverlayControl({ waypoint }: { waypoint: Waypoint }) {
    const map = useMap();

    const relativeWaypoint = useInteractionsStore((s) => s.relativeWaypoint);
    const setBearing = useInteractionsStore((s) => s.setRelativeWaypointBearing);
    const setDistance = useInteractionsStore((s) => s.setRelativeWaypointDistance);
    const create = useInteractionsStore((s) => s.createRelativeWaypoint);
    const selectOnly = useInteractionsStore((s) => s.selectOnly);

    const [point, setPoint] = useState(() => map.latLngToContainerPoint([waypoint.lat, waypoint.lng]));

    useEffect(() => {
        const update = () => {
            setPoint(map.latLngToContainerPoint([waypoint.lat, waypoint.lng]));
        };

        update();

        map.on("move zoom zoomanim", update);
        return () => {
            map.off("move zoom zoomanim", update);
        };
    }, [map, waypoint.lat, waypoint.lng]);

    return (
        <DisablePropagation>
            <div
                style={{
                    position: "absolute",
                    left: point.x,
                    top: point.y,
                    transform: "translate(-50%, 32px)",
                    zIndex: 1000,
                    pointerEvents: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="rounded bg-white p-2 shadow flex flex-row gap-2 items-end">
                    <NumberInput
                        label="Bearing °"
                        value={relativeWaypoint.bearing}
                        onChange={(value) => {
                            if (value !== undefined) setBearing(value % 360);
                        }}
                        className="max-w-16"
                    />
                    <NumberInput
                        label="Distance m"
                        value={relativeWaypoint.distance}
                        min={0.1}
                        onChange={(value) => {
                            if (value !== undefined) setDistance(value);
                        }}
                        className="max-w-16"
                    />
                    <IconButton
                        onClick={() => {
                            const newId = create();
                            selectOnly("waypoint", newId);
                        }}
                        color="blue"
                        icon={<CheckLinear size={16} />}
                    />
                </div>
            </div>
        </DisablePropagation>
    );
}
