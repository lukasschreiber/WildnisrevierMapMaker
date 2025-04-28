export function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timeoutId: number;

    const debouncedFunction = (...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };

    debouncedFunction.cancel = () => {
        clearTimeout(timeoutId);
    };

    return debouncedFunction;
}