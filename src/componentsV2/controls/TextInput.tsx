import { FormControl, InputProps } from "./FormControl";

export interface TextInputProps extends InputProps<string, HTMLInputElement> {
    label?: string;
    helpText?: string;
}

export function TextInput({ label, helpText, id, className, value, onChange, ...rest }: TextInputProps) {
    return (
        <FormControl id={id} label={label} helpText={helpText}>
            <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className={`rounded border border-slate-300 shadow-sm hover:shadow-md focus:outline-none focus:ring focus:ring-slate-800 focus:border-slate-800 transition px-3 py-1 text-sm text-gray-800 ${className ?? ""}`}
                {...rest}
            />
        </FormControl>
    );
}
