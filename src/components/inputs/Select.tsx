import { InputProps } from "./Input";

export interface SelectProps<T extends string | number> extends InputProps<T, HTMLSelectElement> {
    options: Array<{ label: string; value: T }>;
}
export function Select<T extends string | number>(props: SelectProps<T>) {
    const { value, onChange, options, className, ...rest } = props;

    return (
        <select
            className={className + " " + "bg-black/50 p-1 rounded-md disabled:bg-black/25 disabled:cursor-not-allowed text-white"}
            value={value}
            onChange={(e) => {
                const selectedValue = e.target.value as T;
                onChange(selectedValue);
            }}
            {...rest}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
