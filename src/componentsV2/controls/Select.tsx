import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUpLinear } from "@lukasschreiber/icons";
import { FormControl, InputProps } from "./FormControl";
import { useClickOutside } from "../../hooks/useClickOutside";

export interface SelectOption<T extends string | number> {
    value: T;
    children: ReactNode;
}

export interface SelectProps<T extends string | number> extends Omit<
    InputProps<T, HTMLButtonElement>,
    "onChange" | "value" | "placeholder" | "type"
> {
    value: T;
    onChange: (value: T) => void;
    options: SelectOption<T>[];
    label?: string;
    helpText?: string;
    placeholder?: ReactNode;
    startAdornment?: ReactNode | ((value: T) => ReactNode);
}

export function Select<T extends string | number>({
    options,
    label,
    helpText,
    id,
    className,
    value,
    onChange,
    placeholder = "Select...",
    startAdornment,
    ...rest
}: SelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setOpen(false));

    useLayoutEffect(() => {
        if (!open || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        setPlacement(spaceBelow < 260 && spaceAbove > spaceBelow ? "top" : "bottom");
    }, [open]);

    const selected = options.find((option) => option.value === value);
    const adornment = typeof startAdornment === "function" ? startAdornment(value) : startAdornment;

    return (
        <FormControl id={id} label={label} helpText={helpText}>
            <div ref={ref} className="relative">
                <button
                    id={id}
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={`flex w-full items-center gap-2 rounded border border-slate-300 px-3 py-1 text-sm text-gray-800 shadow-sm transition hover:shadow-md focus:border-slate-800 focus:outline-none focus:ring focus:ring-slate-800 ${className ?? ""}`}
                    {...rest}
                >
                    {adornment}

                    <span className="min-w-0 flex-1 text-left">{selected?.children ?? placeholder}</span>

                    <motion.span
                        animate={{ rotate: open ? 0 : 180 }}
                        transition={{ duration: 0.15 }}
                        className="ml-1 shrink-0 text-gray-500"
                    >
                        <ChevronUpLinear className="h-4 w-4" />
                    </motion.span>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: placement === "top" ? 4 : -4,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: placement === "top" ? 4 : -4,
                            }}
                            transition={{ duration: 0.12 }}
                            className={`absolute z-50 max-h-64 w-full overflow-auto rounded border border-slate-200 bg-white py-1 shadow-lg ${
                                placement === "top" ? "bottom-full mb-1" : "top-full mt-1"
                            }`}
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                                        option.value === value ? "bg-slate-100" : ""
                                    }`}
                                >
                                    {option.children}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </FormControl>
    );
}
