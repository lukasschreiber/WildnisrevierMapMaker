import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface TopBubbleItem {
    id: string | number;
    label?: string;
    element?: React.ReactNode; // custom bubble content
}

export function TopBubbleList({
    items,
    className,
}: {
    items: TopBubbleItem[];
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [placementBelow, setPlacementBelow] = useState(false);

    const updateScrollArrows = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const hasOverflow = el.scrollWidth > el.clientWidth + 4;
        const canScrollLeft = el.scrollLeft > 0;
        const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
        
        setShowLeftArrow(hasOverflow && canScrollLeft);
        setShowRightArrow(hasOverflow && canScrollRight);
    };

    useLayoutEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        updateScrollArrows();
        const ro = new ResizeObserver(updateScrollArrows);
        ro.observe(el);
        ro.observe(document.body);
        return () => ro.disconnect();
    }, [items]);

    useEffect(() => {
        // decide whether to place below or on the right based on available space
        const parent = containerRef.current?.parentElement;
        if (!parent) return;

        const updatePlacement = () => {
            const parentRect = parent.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            // if there's less than 220px to the right, place below
            const spaceRight = windowWidth - (parentRect.right || 0);
            setPlacementBelow(spaceRight < 220);
        };

        updatePlacement();
        window.addEventListener("resize", updatePlacement);
        return () => window.removeEventListener("resize", updatePlacement);
    }, []);

    const scrollBy = (dir: "left" | "right") => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.6;
        el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    };

    return (
        <div
            ref={containerRef}
            className={`${className || ""}`}
        >
            <div className="flex items-center relative">
                {showLeftArrow && (
                    <button
                        aria-label="scroll-left"
                        className="p-1 mr-1 h-8 bg-white rounded-full shadow hover:bg-gray-100 absolute left-0 top-1/2 -translate-y-1/2"
                        onClick={() => scrollBy("left")}
                    >
                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}

                <div
                    ref={scrollerRef}
                    className={`flex gap-2 items-center overflow-x-auto no-scrollbar p-1 ${placementBelow ? "max-w-full px-2" : "max-w-64"}`}
                    onScroll={updateScrollArrows}
                >
                    {items.map((it) => (
                        <div
                            key={it.id}
                            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap text-sm text-gray-800"
                        >
                            {it.element ?? <div className="w-6 h-6 rounded-full bg-blue-400" />}
                            {it.label}
                        </div>
                    ))}
                </div>

                {showRightArrow && (
                    <button
                        aria-label="scroll-right"
                        className="p-1 ml-1 bg-white rounded-full shadow hover:bg-gray-100 absolute right-0 top-1/2 -translate-y-1/2"
                        onClick={() => scrollBy("right")}
                    >
                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}