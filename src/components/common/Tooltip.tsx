import React, { ReactNode, useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type TooltipProps = {
    children: ReactNode;
    text: ReactNode;
    position?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({ children, text, position = "top" }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties | null>(null);
    const [shouldRender, setShouldRender] = useState(false);

    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Trigger render of the tooltip so we can measure it
    useEffect(() => {
        if (visible) {
            setShouldRender(true);
        } else {
            setShouldRender(false);
            setStyle(null);
        }
    }, [visible]);

    // Once rendered, measure and position the tooltip
    useLayoutEffect(() => {
        if (!shouldRender) return;

        const updatePosition = () => {
            if (!triggerRef.current || !tooltipRef.current) return;

            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const margin = 8;

            let top = 0;
            let left = 0;

            switch (position) {
                case "top":
                    top = triggerRect.top - tooltipRect.height - margin;
                    left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                    break;
                case "bottom":
                    top = triggerRect.bottom + margin;
                    left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                    break;
                case "left":
                    top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                    left = triggerRect.left - tooltipRect.width - margin;
                    break;
                case "right":
                    top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                    left = triggerRect.right + margin;
                    break;
            }

            setStyle({
                position: "fixed",
                top: Math.max(top, 0),
                left: Math.max(left, 0),
                zIndex: 99999,
            });
        };

        // Wait for tooltip to mount in the DOM
        requestAnimationFrame(updatePosition);

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [shouldRender, position, text]);

    if (!text) return <>{children}</>;

    return (
        <>
            <div
                ref={triggerRef}
                className="inline-block"
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
            >
                {children}
            </div>

            {createPortal(
                <AnimatePresence>
                    {shouldRender && (
                        <motion.div
                            ref={tooltipRef}
                            // @ts-expect-error - Framer Motion's style typing is incomplete
                            style={style || { visibility: "hidden" }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="bg-white text-gray-800 text-xs px-3 py-1 rounded shadow-md pointer-events-none w-fit"
                            role="tooltip"
                        >
                            {text}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
