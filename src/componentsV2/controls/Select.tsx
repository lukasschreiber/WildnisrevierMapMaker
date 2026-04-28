import { FormControl, InputProps } from "./FormControl";

export interface SelectProps<T extends string | number> extends InputProps<T, HTMLSelectElement> {
    options: Array<{ label: string; value: T }>;
    label?: string;
    helpText?: string;
}

export function Select<T extends string | number>({
    options,
    label,
    helpText,
    id,
    className,
    value,
    onChange,
    ...rest
}: SelectProps<T>) {
    return (
        <FormControl id={id} label={label} helpText={helpText}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className={`rounded border border-slate-300 shadow-sm hover:shadow-md focus:outline-none focus:ring focus:ring-slate-800 focus:border-slate-800 transition px-3 py-1 text-sm text-gray-800 ${className ?? ""}`}
                {...rest}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FormControl>
    );
}
