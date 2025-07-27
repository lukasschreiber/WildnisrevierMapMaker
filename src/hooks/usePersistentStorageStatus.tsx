import { useEffect, useState } from "react";

export function usePersistentStorageStatus(): boolean | null {
    const [isPersistent, setIsPersistent] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkPersistence() {
            if (navigator.storage && navigator.storage.persist) {
                try {
                    const result = await navigator.storage.persist();
                    setIsPersistent(result);
                } catch (error) {
                    console.error("Error checking storage persistence:", error);
                    setIsPersistent(false);
                }
            } else {
                console.warn("Persistent storage API not supported.");
                setIsPersistent(false);
            }
        }

        checkPersistence();
    }, []);

    return isPersistent;
}
