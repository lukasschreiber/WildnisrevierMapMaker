import { useSettings } from "../settings/useSettings";

export function SettingsContainer() {
    const { settings, set, layout } = useSettings();
    return (
        <div className="flex flex-col gap-2">
            {layout.map((group) => (
                <div key={group.name} className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold">{group.name}</h2>
                    {Object.entries(group.settings).map(([_key, setting]) => {
                        const key = _key as keyof typeof settings;

                        if (
                            setting.hidden &&
                            (typeof setting.hidden === "function" ? setting.hidden(settings) : setting.hidden)
                        ) {
                            return null;
                        }

                        if (setting.type === "checkbox") {
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    <input
                                        id={key}
                                        type="checkbox"
                                        checked={settings[key] as boolean}
                                        onChange={(e) => set(key, e.target.checked)}
                                    />
                                    <label className="flex flex-col" htmlFor={key}>
                                        <span>{setting.label}</span>
                                        {setting.helpText && <span className="text-black/80">{setting.helpText}</span>}
                                    </label>
                                </div>
                            );
                        } else if (setting.type === "range") {
                            return (
                                <div key={key} className="flex flex-col">
                                    <label>
                                        {setting.label} (
                                        {setting.valueFormatter
                                            ? setting.valueFormatter(settings[key] as number)
                                            : settings[key]}
                                        )
                                    </label>
                                    <input
                                        type="range"
                                        min={setting.min}
                                        max={setting.max}
                                        step={setting.stepSize}
                                        value={settings[key] as number}
                                        onChange={(e) => set(key, parseFloat(e.target.value))}
                                    />
                                    <span className="text-black/80">{setting.helpText}</span>
                                </div>
                            );
                        } else if (setting.type === "color") {
                            return (
                                <div key={key} className="flex flex-col">
                                    <label>{setting.label}</label>
                                    <input
                                        type="color"
                                        value={settings[key] as string}
                                        onChange={(e) => set(key, e.target.value)}
                                    />
                                    <span className="text-black/80">{setting.helpText}</span>
                                </div>
                            );
                        }
                    })}
                </div>
            ))}
        </div>
    );
}
