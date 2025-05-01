import { useState, useEffect } from "react";
import { getLocalStorageKey } from "../utils/keys";

export function useLocalStorage<T>(key_: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const key = getLocalStorageKey(key_);
    const [value, setValue] = useState<T>(() => {
        let currentValue;

        try {
            currentValue = JSON.parse(localStorage.getItem(key) || String(defaultValue));
        } catch (error) {
            currentValue = defaultValue;
        }

        return currentValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
}

export default useLocalStorage;
