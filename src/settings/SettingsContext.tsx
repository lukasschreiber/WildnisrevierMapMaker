import { createContext, useEffect, useState } from "react";
import { LayoutGroup, Settings, getDefaultSettings } from "./settings_definition";
import { getSettingsDefinition } from "./settings";

export interface IPublicSettingsContext {
    settings: Settings;
    set<K extends keyof Settings>(key: K, value: Settings[K]): void;
}

interface ISettingsContext extends IPublicSettingsContext {
    layout: LayoutGroup[];
    isHidden<K extends keyof Settings>(key: K): boolean;
}

export const SettingsContext = createContext<ISettingsContext | undefined>(undefined);

export function SettingsProvider(props: React.ComponentPropsWithoutRef<"div">) {

    const LOCAL_STORAGE_KEY = "map_settings";
    const [settings, setSettings] = useState<Settings>(() => {
        const storedSettings = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedSettings ? JSON.parse(storedSettings) : getDefaultSettings(getSettingsDefinition());
    });
    const layout = getSettingsDefinition();

    useEffect(() => {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
                setSettings(JSON.parse(event.newValue));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    function set<K extends keyof Settings>(key: K, value: Settings[K]) {
        setSettings((prevSettings) => {
            const newSettings = { ...prevSettings, [key]: value };
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
            return newSettings;
        });
    }

    function isHidden<K extends keyof Settings>(key: K): boolean {
        const setting = layout.find((group) => Object.keys(group.settings).includes(key))?.settings[key];
        if (!setting) return false;
        return typeof setting.hidden === "function" ? setting.hidden(settings) : setting.hidden ?? false;
    }

    return (
        <SettingsContext.Provider value={{ isHidden, set, settings, layout }}>
            {props.children}
        </SettingsContext.Provider>
    );
}
