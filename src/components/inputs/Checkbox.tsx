import { InputProps } from "./Input";

export interface CheckboxProps extends InputProps<boolean, HTMLInputElement> {
    label?: string;
}

export function Checkbox(props: CheckboxProps) {
    const { value, label, onChange, className, ...rest } = props;

    const id = rest.id || "checkbox-" + Math.random().toString(36).substring(2, 15);

    return (
        <div className={className + " " + "flex flex-row items-center gap-2"}>
            <input type="checkbox" id={id} checked={value} onChange={(e) => onChange(e.target.checked)} {...rest} />
            {label && <label htmlFor={id} className="text-xs">
                {label}
            </label>}
        </div>
    );
}
