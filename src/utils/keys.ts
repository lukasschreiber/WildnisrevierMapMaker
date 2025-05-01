export function getLocalStorageKey(key: string): string {
    key = key.replace(/[^a-zA-Z0-9]/g, "_");
    return `mapmaker-${key}`;
}