import { useMemo } from "react";
import { usePathContext } from "../context/PathContext";

export function SegmentInfo(props: { id: number }) {
    const { getSegmentById, deleteSegment, deselectSegment } = usePathContext();
    const segment = useMemo(() => getSegmentById(props.id), [props.id, getSegmentById]);

    if (!segment) {
        return null;
    }

    return (
        <div className="gap-2 flex flex-col">
            <h2 className="text-xs">Selected Segment</h2>
            <p>ID: {segment.id}</p>
            <p>From Waypoint ID: {segment.from.waypointId}</p>
            <p>To Waypoint ID: {segment.to.waypointId}</p>
            <button
                onClick={() => {
                    if (confirm("Are you sure you want to delete this segment?")) {
                        deleteSegment(segment.id);
                        deselectSegment();
                    }
                }}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded"
            >
                Delete Segment
            </button>
        </div>
    );
}