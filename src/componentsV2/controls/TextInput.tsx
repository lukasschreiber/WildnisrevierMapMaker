import { useId } from "react";
import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function TextInput({ label, id, className, ...rest }: TextInputProps) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={inputId} className="text-sm text-gray-800">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type="text"
                className={`rounded border border-slate-300 shadow-sm hover:shadow-md focus:outline-none focus:ring focus:ring-slate-800 focus:border-slate-800 transition px-3 py-1 text-sm text-gray-800 ${className ?? ""}`}
                {...rest}
            />
        </div>
    );
}
