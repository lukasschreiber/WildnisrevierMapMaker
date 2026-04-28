import { XmarkLinear } from "@lukasschreiber/icons";
import { FormControl, InputProps } from "./FormControl";

interface NumberInputProps extends InputProps<number | undefined, HTMLInputElement> {
    label?: string;
    helpText?: string;
    allowNull?: boolean;
}

export function NumberInput({ label, helpText, id, className, value, onChange, allowNull, ...rest }: NumberInputProps) {
    return (
        <FormControl id={id} label={label} helpText={helpText}>
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    value={value ?? ""}
                    onChange={(e) => {
                        const raw = e.target.value;

                        if (raw === "") {
                            onChange(allowNull ? undefined : 0);
                            return;
                        }

                        const parsed = Number(raw);

                        if (!isNaN(parsed)) {
                            onChange(parsed);
                        }
                    }}
                    className={`flex-1 rounded border border-slate-300 shadow-sm hover:shadow-md focus:outline-none focus:ring focus:ring-slate-800 focus:border-slate-800 transition px-3 py-1 text-sm text-gray-800 ${className ?? ""}`}
                    {...rest}
                />

                {allowNull && (
                    <button
                        type="button"
                        onClick={() => onChange(undefined)}
                        className="p-1 hover:text-red-500 rounded-2xl cursor-pointer"
                        tabIndex={-1}
                    >
                        <XmarkLinear size={14} />
                    </button>
                )}
            </div>
        </FormControl>
    );
}
