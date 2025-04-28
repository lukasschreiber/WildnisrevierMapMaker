export interface InputProps<T, El extends HTMLElement> extends Omit<React.InputHTMLAttributes<El>, 'value' | 'onChange'> {
    value: T | undefined;
    onChange: (value: T) => void;
}