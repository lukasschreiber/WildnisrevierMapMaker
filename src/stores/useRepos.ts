import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLocalStorageKey } from "../utils/keys";

export interface Repository {
    id: string;
    name: string;
    url: string;
    key: string
}

interface RepoStore {
    repositories: Repository[];
    encryptKeys: boolean;
    addRepository: (repo: Repository) => void;
    removeRepository: (id: string) => void;
    toggleEncryption: (enabled: boolean) => void;
};

function encrypt(key: string): string {
    return key;
}

function decrypt(key: string): string {
    return key;
}

// TODO: Use AES

export const useRepoStore = create<RepoStore>()(
    persist(
        (set, get) => ({
            repositories: [],
            encryptKeys: false,

            addRepository: (repo) => {
                const shouldEncrypt = get().encryptKeys;
                const storedRepo = {
                    ...repo,
                    keys: shouldEncrypt ? encrypt(repo.key) : repo.key,
                };
                set((state) => ({
                    repositories: [...state.repositories, storedRepo],
                }));
            },

            removeRepository: (id) => {
                set((state) => ({
                    repositories: state.repositories.filter((r) => r.id !== id),
                }));
            },

            toggleEncryption: (enabled) => {
                const currentRepos = get().repositories;
                const updated = currentRepos.map((repo) => ({
                    ...repo,
                    keys: enabled ? encrypt(repo.key) : decrypt(repo.key),
                }));

                set({
                    encryptKeys: enabled,
                    repositories: updated,
                });
            },
        }),
        {
            name: getLocalStorageKey("repos"),
        }
    )
);
