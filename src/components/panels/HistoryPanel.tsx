import { useHistoryStore } from "../../stores/useHistory";
import { Panel } from "../Panel";

function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function HistoryPanel() {
    const past = useHistoryStore((state) => state.past);

    const orderedPast = [...past].reverse();

    return (
        <Panel title="History">
            <div className="px-4 py-3 text-sm">
                {past.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-300 px-3 py-6 text-center text-gray-500">
                        No history yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orderedPast.length > 0 && (
                            <section>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Undo stack
                                </div>

                                <div className="space-y-1">
                                    {orderedPast.map((entry, index) => (
                                        <div
                                            key={entry.id}
                                            className={[
                                                "flex items-center justify-between rounded-lg border px-3 py-2",
                                                index === 0
                                                    ? "border-blue-300 bg-blue-50"
                                                    : "border-gray-200 bg-gray-50",
                                            ].join(" ")}
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-gray-700">{entry.label}</div>
                                                <div className="text-xs text-gray-400">
                                                    {entry.mutations.length} change
                                                    {entry.mutations.length === 1 ? "" : "s"}
                                                </div>
                                            </div>

                                            <div className="ml-3 shrink-0 text-xs text-gray-400">
                                                {formatTime(entry.timestamp)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </Panel>
    );
}
