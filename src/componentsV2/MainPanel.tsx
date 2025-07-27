import React, { HTMLProps } from "react";

interface MainPanelProps extends Omit<HTMLProps<HTMLDivElement>, "title"> {
    title?: React.ReactNode;
}

export function Panel(props: MainPanelProps) {
    const { title, children, className, ...rest } = props;

    return (
        <div
            className={`flex flex-col h-full absolute left-0 top-0 bottom-0 bg-white z-[1001] w-72 border-l border-gray-200 shadow-lg ${className || ""}`}
            {...rest}
        >
            <div className="bg-white w-full h-20" />
            {title && <div className="px-4 py-1 text-md font-semibold text-gray-800">{title}</div>}
            <div className="flex-1 overflow-y-auto">
                <div>{children}</div>
            </div>
        </div>
    );
}
