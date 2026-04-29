export function uniqueDefId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
}

export function safeIdPart(value: string | undefined): string {
    return (value ?? "")
        .replace("#", "")
        .replace(/[^a-zA-Z0-9_-]/g, "");
}
