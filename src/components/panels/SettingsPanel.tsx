import { useSettingsStore } from "../../stores/useSettings";
import { Checkbox } from "../inputs/Checkbox";
import { ColorInput } from "../inputs/ColorInput";
import { Select } from "../inputs/Select";

export function SettingsPanel() {
    const settings = useSettingsStore((state) => state.settings);
    const layout = useSettingsStore((state) => state.layout);
    const set = useSettingsStore((state) => state.set);
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
                                <Checkbox
                                    key={key}
                                    id={key}
                                    label={setting.label}
                                    value={settings[key] as boolean}
                                    onChange={(value) => set(key, value)}
                                    className="flex flex-col"
                                />
                            );
                        } else if (setting.type === "select") {
                            return (
                                <div key={key} className="flex flex-col gap-1">
                                    <label>{setting.label}</label>
                                    <Select
                                        key={key}
                                        id={key}
                                        value={settings[key] as string}
                                        options={setting.options as { value: string; label: string }[]}
                                        onChange={(value) => set(key, value)}
                                        className="flex flex-col"
                                    />
                                    <span className="text-black/80">{setting.helpText}</span>
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
                                    <ColorInput value={settings[key] as string} onChange={(value) => set(key, value)} />
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
