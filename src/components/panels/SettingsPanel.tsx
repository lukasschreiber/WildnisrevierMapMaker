import { useSettingsStore } from "../../stores/useSettings";
import { Checkbox } from "../controls/Checkbox";
import { ColorInput } from "../controls/ColorInput";
import { FormControl } from "../controls/FormControl";
import { Select } from "../controls/Select";
import { Panel } from "../Panel";

export function SettingsPanel() {
    const settings = useSettingsStore((state) => state.settings);
    const layout = useSettingsStore((state) => state.layout);
    const set = useSettingsStore((state) => state.set);
    return (
        <Panel title="Settings">
            <div className="flex flex-col gap-6 px-4 py-2">
                {layout.map((group) => (
                    <div key={group.name} className="flex flex-col gap-2">
                        <div className="text-sm font-medium text-gray-700">{group.name}</div>
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
                                    />
                                );
                            } else if (setting.type === "select") {
                                const rawOptions =
                                    setting.options instanceof Function ? setting.options(settings) : setting.options;

                                return (
                                    <Select
                                        key={key}
                                        id={key}
                                        value={settings[key] as string}
                                        options={rawOptions.map((option) => ({
                                            value: option.value,
                                            children: option.icon ? (
                                                <>
                                                    {option.icon} {option.label}
                                                </>
                                            ) : (
                                                option.label
                                            ),
                                        }))}
                                        onChange={(value) => set(key, value)}
                                        label={setting.label}
                                        helpText={setting.helpText}
                                    />
                                );
                            } else if (setting.type === "range") {
                                return (
                                    <div key={key} className="flex flex-col">
                                        <FormControl
                                            label={
                                                <div>
                                                    {setting.label} (
                                                    {setting.valueFormatter
                                                        ? setting.valueFormatter(settings[key] as number)
                                                        : settings[key]}
                                                    )
                                                </div>
                                            }
                                            helpText={setting.helpText}
                                        >
                                            <input
                                                type="range"
                                                min={setting.min}
                                                max={setting.max}
                                                step={setting.stepSize}
                                                value={settings[key] as number}
                                                onChange={(e) => set(key, parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                    </div>
                                );
                            } else if (setting.type === "color") {
                                return (
                                    <ColorInput
                                        value={settings[key] as string}
                                        onChange={(value) => set(key, value)}
                                        label={setting.label}
                                        helpText={setting.helpText}
                                    />
                                );
                            }
                        })}
                    </div>
                ))}
            </div>
        </Panel>
    );
}
