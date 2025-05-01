import { InputProps } from "./Input";

export function TextInput(props: InputProps<string, HTMLInputElement>) {
    const { value, onChange, className, ...rest } = props;

    return (
        <input
            type="text"
            className={className + " " + "bg-black/50 p-1 rounded-md disabled:bg-black/25 disabled:cursor-not-allowed text-white"}
            value={value}
            onChange={(e) => {
                const newValue = e.target.value;
                onChange(newValue);
            }}
            {...rest}
        />
    );
}