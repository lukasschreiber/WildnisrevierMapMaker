interface ButtonProps {
    icon?: React.ReactNode;
    onClick: () => void;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    color?: "red" | "blue" | "gray";
}

export function Button({ icon, onClick, children, className = "", disabled = false, color = "gray" }: ButtonProps) {
    const baseClasses = "flex items-center gap-2 rounded-lg px-2 py-1 transition-colors cursor-pointer";
    const colorClasses = {
        red: "bg-red-200 hover:bg-red-300 text-red-900",
        blue: "bg-blue-200 hover:bg-blue-300 text-blue-900",
        gray: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    };

    return (
        <button onClick={onClick} className={`${baseClasses} ${colorClasses[color]} ${className}`} disabled={disabled}>
            {icon} {children}
        </button>
    );
}
