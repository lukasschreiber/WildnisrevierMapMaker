import { HTMLProps, ReactNode } from "react";

export function Chip({ children, className }: HTMLProps<HTMLDivElement> & { children: ReactNode }) {
    return (
        <div
            className={`inline-flex shrink-0 h-8 max-h-8 min-h-8 items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white ${className}"}`}
        >
            {children}
        </div>
    );
}