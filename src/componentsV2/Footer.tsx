import { Link } from "./common/Link";
import BranchIcon from "../assets/icons/code-branch.svg?react";
import SyncIcon from "../assets/icons/refresh-cw-alt.svg?react";

export function Footer() {
    return (
        <footer className="bg-white text-xs p-1 flex flex-row justify-between items-center border-t border-gray-200 text-gray-900">
            <div className="flex flex-row gap-1 items-center cursor-pointer">
                <BranchIcon className="w-3.5 h-3.5" />
                <span className="text-gray-600">main*</span>
                <SyncIcon className="w-3.5 h-3.5 hover:animate-spin" />
            </div>
            <div className="flex gap-2">
                <div>Wayoints: 10</div>
                <div>Paths: 5</div>
                <div>Shapes: 3</div>
                <Link href="">Imprint</Link>
                <Link href="">Privacy Policy</Link>
                <div>v. 1.0.0</div>
            </div>
        </footer>
    );
}
