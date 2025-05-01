import { useEffect, useMemo } from "react";
import { InputProps } from "./Input";
import { debounce } from "../../utils/debounce";

export function ColorInput(props: InputProps<string, HTMLInputElement>) {
    const { value, onChange, className, ...rest } = props;

    // Create the debounced onChange function
    const debouncedOnChange = useMemo(() => debounce(onChange, 25), [onChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedOnChange.cancel();
        };
    }, [debouncedOnChange]);

    return (
        <input
            type="color"
            className={
                className +
                " " +
                "bg-black/50 p-1 rounded-md disabled:opacity-40 disabled:cursor-not-allowed text-white"
            }
            value={value}
            onChange={(e) => {
                debouncedOnChange(e.target.value);
            }}
            {...rest}
        />
    );
}
