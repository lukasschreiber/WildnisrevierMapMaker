import { InputProps } from "./Input";

export function ColorInput(props: InputProps<string, HTMLInputElement>) {
    const { value, onChange, className, ...rest } = props;

    return (
        <input
            type="color"
            className={className + " " + "bg-black/50 p-1 rounded-md disabled:opacity-40 disabled:cursor-not-allowed text-white"}
            value={value}
            onChange={(e) => {
                const newValue = e.target.value;
                onChange(newValue);
            }}
            {...rest}
        />
    );
}