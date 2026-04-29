import { useEffect, useMemo } from "react";
import { FormControl, InputProps } from "./FormControl";
import { debounce } from "../../utils/debounce";

interface ColorInputProps extends InputProps<string, HTMLInputElement> {
    label?: string;
    helpText?: string;
    debounceMs?: number;
}

export function ColorInput({
    label,
    helpText,
    id,
    className,
    value,
    onChange,
    debounceMs = 25,
    disabled,
    ...rest
}: ColorInputProps) {
    const colorValue = value ?? "#000000";

    const debouncedOnChange = useMemo(() => debounce(onChange, debounceMs), [onChange, debounceMs]);

    useEffect(() => {
        return () => debouncedOnChange.cancel();
    }, [debouncedOnChange]);

    return (
        <FormControl id={id} label={label} helpText={helpText}>
            <label
                className={`
                    flex h-9 w-full items-center gap-2
                    rounded border px-2 transition
                    ${
                        disabled
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                            : "cursor-pointer border-slate-300 bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
                    }
                    ${className ?? ""}
                `}
            >
                {/* Color swatch */}
                <span
                    className={`
                        h-5 w-8 rounded border
                        ${disabled ? "border-slate-200" : "border-slate-300"}
                    `}
                    style={{
                        backgroundColor: colorValue,
                    }}
                />

                {/* Hex text */}
                <span
                    className={`
                        flex-1 font-mono text-xs uppercase
                        ${disabled ? "text-gray-400" : "text-gray-700"}
                    `}
                >
                    {colorValue}
                </span>

                {/* Hidden native picker */}
                <input
                    id={id}
                    type="color"
                    value={colorValue}
                    disabled={disabled}
                    onChange={(e) => {
                        if (!disabled) {
                            debouncedOnChange(e.target.value);
                        }
                    }}
                    className="sr-only w-0 h-0"
                    {...rest}
                />
            </label>
        </FormControl>
    );
}
