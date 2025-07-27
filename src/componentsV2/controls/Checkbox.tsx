import { useId } from "react";

interface CheckboxProps extends React.HTMLProps<HTMLInputElement> {
    label?: string;
}

export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <label htmlFor={inputId} className="flex items-center cursor-pointer relative gap-2">
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    id={inputId}
                    className={`peer h-4.5 w-4.5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800 ${className ?? ""}`}
                    {...rest}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            </div>
            {label && <span className="ml-1 text-sm text-gray-800">{label}</span>}
        </label>
    );
}
