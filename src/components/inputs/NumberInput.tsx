import { InputProps } from "./Input";

export function NumberInput(props: InputProps<number, HTMLInputElement>) {
    const { value, onChange, className, ...rest } = props;

    return (
        <input
            type="number"
            className={className + " " + "bg-black/50 p-1 rounded-md disabled:bg-black/25 disabled:cursor-not-allowed text-white"}
            value={value}
            onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                onChange(isNaN(newValue) ? 0 : newValue);
            }}
            {...rest}
        />
    );
}