import { ReactNode } from "react";
import { FormControl, InputProps } from "./FormControl";

export interface TextInputProps extends InputProps<string, HTMLInputElement> {
    label?: ReactNode;
    helpText?: ReactNode;
}

export function TextInput({ label, helpText, id, className, value, onChange, ...rest }: TextInputProps) {
    return (
        <FormControl id={id} label={label} helpText={helpText}>
            <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className={`rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition px-3 py-1 text-sm text-gray-800 ${className ?? ""}`}
                {...rest}
            />
        </FormControl>
    );
}
