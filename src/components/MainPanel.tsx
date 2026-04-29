import React, { HTMLProps } from "react";
import { useNavigate } from "react-router";

interface MainPanelProps extends Omit<HTMLProps<HTMLDivElement>, "title"> {
    title?: React.ReactNode;
    topColor?: string;
    topComponent?: React.ReactNode;
    backButton?: {
        path?: string;
        label?: string;
    };
}

export function Panel(props: MainPanelProps) {
    const { title, children, className, topColor, topComponent, backButton, ...rest } = props;
    const navigate = useNavigate();

    return (
        <div className={`h-full absolute left-0 top-0 bottom-0 z-[1001] w-72 ${className || ""}`} {...rest}>
            <div className="flex flex-col h-full bg-white border-gray-200 shadow-lg border-l">
                <div className="w-full h-20 relative" style={{ backgroundColor: topColor ?? "white" }}>
                    {topComponent}
                    {backButton && (
                        <div className="absolute left-1 bottom-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer"
                            onClick={() => {
                                if (backButton.path) {
                                    navigate(backButton.path);
                                } else {
                                    navigate(-1);
                                }
                            }}
                        >
                            {backButton.label ?? "Back"}
                        </div>
                    )}
                </div>
                {title && <div className="px-4 py-1 text-md font-semibold text-gray-800">{title}</div>}
                <div className="flex-1 overflow-y-auto">
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
}
