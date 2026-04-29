import { CircleInformationLinear } from "@lukasschreiber/icons";
import { cloneElement, ReactElement, useId } from "react";

type ChildWithId = ReactElement<{ id?: string; "aria-describedby"?: string }>;

export interface InputProps<T, El extends HTMLElement> extends Omit<
    React.InputHTMLAttributes<El>,
    "value" | "onChange"
> {
    value?: T;
    onChange: (value: T) => void;
    id?: string;
}

interface FormControlProps {
    id?: string;
    label?: string;
    helpText?: string;
    children: ChildWithId;
}

export function FormControl({ id, label, helpText, children }: FormControlProps) {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const helpId = helpText ? `${controlId}-help` : undefined;

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={controlId} className="text-[8pt] text-gray-800">
                    {label}
                </label>
            )}

            {cloneElement(children, {
                id: controlId,
                "aria-describedby": helpId,
            })}

            {helpText && (
                <div id={helpId} className="text-[8pt] text-gray-500 flex gap-1 items-start">
                    <div className="shrink-0">
                        <CircleInformationLinear size={16} />
                    </div>
                    <div>{helpText}</div>
                </div>
            )}
        </div>
    );
}
