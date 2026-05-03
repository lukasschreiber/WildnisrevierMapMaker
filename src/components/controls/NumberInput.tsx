import { XmarkLinear } from "@lukasschreiber/icons";
import { FormControl, InputProps } from "./FormControl";
import { ReactNode } from "react";

interface NumberInputProps extends InputProps<number | undefined, HTMLInputElement> {
    label?: ReactNode;
    helpText?: ReactNode;
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

                        const parsed = parseFloat(raw);

                        if (!isNaN(parsed)) {
                            onChange(parsed);
                        }
                    }}
                    className={`flex-1 rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-0 transition pl-3 py-1 text-sm text-gray-800 ${className ?? ""}`}
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
