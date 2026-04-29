import { Link } from "./common/Link";
import { usePersistentStorageStatus } from "../hooks/usePersistentStorageStatus";
import { useShapeStore } from "../stores/useShapes";
import { useWaypointStore } from "../stores/useWaypoints";
import { usePathStore } from "../stores/usePaths";
import { CircleCheckLinear, CodeBranchLinear, RefreshCwLinear, TriangleExclamationLinear } from "@lukasschreiber/icons";

export function Footer() {
    const hasPersistentStorage = usePersistentStorageStatus();
    const shapes = useShapeStore((state) => state.shapes.length);
    const waypoints = useWaypointStore((state) => state.waypoints.length);
    const paths = usePathStore((state) => state.paths.length);

    return (
        <footer className="bg-white text-xs flex flex-row justify-between items-center border-t border-gray-200 text-gray-900 z-[1009]">
            <div className="flex flex-row gap-1 items-center cursor-pointer p-1">
                <CodeBranchLinear className="w-3.5 h-3.5" />
                <span className="text-gray-600">MyRepo {">"} main*</span>
                <RefreshCwLinear className="w-3.5 h-3.5 hover:animate-spin" />
            </div>
            <div className="flex gap-2 items-center">
                <div className="flex p-1 gap-2 items-center">
                    <div>Wayoints: {waypoints}</div>
                    <div>Paths: {paths}</div>
                    <div>Shapes: {shapes}</div>
                    <Link href="">Imprint</Link>
                    <Link href="">Privacy Policy</Link>
                    <div>v. 1.0.0</div>
                </div>
                {hasPersistentStorage !== null && (
                    <>
                        {hasPersistentStorage ? (
                            <div className="text-white bg-green-500 flex items-center justify-center self-stretch aspect-square w-6">
                                <CircleCheckLinear className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="text-white bg-red-500 flex items-center justify-center self-stretch aspect-square w-6">
                                <TriangleExclamationLinear className="w-4 h-4" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </footer>
    );
}
