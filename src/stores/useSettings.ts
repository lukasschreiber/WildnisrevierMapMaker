// settingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";
import { getSettingsDefinition } from "../settings/settings";
import { getDefaultSettings, LayoutGroup, Settings } from "../settings/settings_definition";

const LOCAL_STORAGE_KEY = getLocalStorageKey("settings");

export interface SettingsStore {
    settings: Settings;
    layout: LayoutGroup[];
    set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    isHidden: <K extends keyof Settings>(key: K) => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            settings: getDefaultSettings(getSettingsDefinition()),
            layout: getSettingsDefinition(),

            set: (key, value) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        [key]: value
                    }
                }));
            },

            isHidden: (key) => {
                const { layout, settings } = get();
                const setting = layout.find((group) =>
                    Object.keys(group.settings).includes(key)
                )?.settings[key];
                if (!setting) return false;
                return typeof setting.hidden === "function"
                    ? setting.hidden(settings)
                    : (setting.hidden ?? false);
            }
        }),
        {
            name: LOCAL_STORAGE_KEY,
            partialize: (state) => ({ settings: state.settings }), // Persist only settings, not layout or helpers
        }
    )
);
