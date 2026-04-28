import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function TopChipList({ items, className }: { items: ReactNode[]; className?: string }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const scrollAnimationRef = useRef<number | null>(null);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
        const el = scrollerRef.current;
        if (!el) return;

        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
    };

    useLayoutEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        let frame = 0;

        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(updateScrollButtons);
        };

        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);
        ro.observe(document.body);

        el.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);

        return () => {
            cancelAnimationFrame(frame);
            ro.disconnect();
            el.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [items]);

    useEffect(() => {
        return () => {
            if (scrollAnimationRef.current) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, []);

    const scrollBy = (dir: "left" | "right") => {
        const el = scrollerRef.current;
        if (!el) return;

        if (scrollAnimationRef.current) {
            cancelAnimationFrame(scrollAnimationRef.current);
        }

        const start = el.scrollLeft;
        const distance = el.clientWidth * (dir === "left" ? -1 : 1);
        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        const target = Math.max(0, Math.min(start + distance, maxScrollLeft));

        const duration = 320;
        const startTime = performance.now();

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            el.scrollLeft = start + (target - start) * easeOutCubic(progress);

            if (progress < 1) {
                scrollAnimationRef.current = requestAnimationFrame(animate);
            } else {
                scrollAnimationRef.current = null;
                updateScrollButtons();
            }
        };

        scrollAnimationRef.current = requestAnimationFrame(animate);
    };

    return (
        <div ref={containerRef} className={className || ""}>
            <div className="flex items-center relative rounded-full overflow-hidden px-1">
                <AnimatePresence>
                    {canScrollLeft && (
                        <motion.button
                            key="scroll-left"
                            aria-label="scroll-left"
                            type="button"
                            initial={{ opacity: 0, scale: 0.85, x: -6 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.85, x: -6 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="z-10 p-1 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 absolute left-0 top-1/2 -translate-y-1/2"
                            onClick={() => scrollBy("left")}
                        >
                            <svg
                                className="w-4 h-4 text-gray-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 18l-6-6 6-6"
                                />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>

                <div ref={scrollerRef} className="flex gap-2 items-center overflow-x-auto no-scrollbar w-full">
                    {items}
                </div>
                
                <AnimatePresence>
                    {canScrollRight && (
                        <motion.button
                            key="scroll-right"
                            aria-label="scroll-right"
                            type="button"
                            initial={{ opacity: 0, scale: 0.85, x: 6 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.85, x: 6 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="z-10 p-1 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 absolute right-0 top-1/2 -translate-y-1/2"
                            onClick={() => scrollBy("right")}
                        >
                            <svg
                                className="w-4 h-4 text-gray-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
