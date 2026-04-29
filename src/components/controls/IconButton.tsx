import Tooltip from "../common/Tooltip";

interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
    label?: string;
    disabled?: boolean;
    color?: "red" | "blue" | "gray";
}

export function IconButton({
    icon,
    onClick,
    label,
    className = "",
    disabled = false,
    color = "gray",
}: IconButtonProps) {
    const baseClasses = "flex items-center justify-center rounded-full w-10 h-10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";
    const colorClasses = {
        red: "bg-red-200 hover:bg-red-300 text-red-900",
        blue: "bg-blue-200 hover:bg-blue-300 text-blue-900",
        gray: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    };

    return (
        <Tooltip text={label}>
            <button
                onClick={onClick}
                className={`${baseClasses} ${colorClasses[color]} ${className}`}
                disabled={disabled}
            >
                {icon}
            </button>
        </Tooltip>
    );
}
