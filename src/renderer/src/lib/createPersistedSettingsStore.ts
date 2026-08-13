import { create, type UseBoundStore, type StoreApi } from 'zustand'

const PERSIST_DEBOUNCE_MS = 300

export interface PersistedSettingsState<T> {
  values: T
  update: (patch: Partial<T>) => void
  reset: () => void
}

/**
 * Factory for the "a plain settings object with update()/reset()" shape,
 * shared by every settings category. Hydrates from a JSON file under
 * Electron's userData dir (via the main process, keyed by `key`) on
 * creation, and debounce-persists on every change — the store still
 * initializes synchronously with `defaults` so consumers never have to
 * handle a loading state.
 */
export function createPersistedSettingsStore<T extends object>(
  key: string,
  defaults: T
): UseBoundStore<StoreApi<PersistedSettingsState<T>>> {
  let persistTimer: number | null = null

  function persist(values: T): void {
    if (!window.api) return
    if (persistTimer !== null) window.clearTimeout(persistTimer)
    persistTimer = window.setTimeout(() => {
      void window.api?.saveSettings(key, values)
    }, PERSIST_DEBOUNCE_MS)
  }

  function mergeWithDefaults(raw: unknown): T {
    if (!raw || typeof raw !== 'object') return defaults
    return { ...defaults, ...(raw as Partial<T>) }
  }

  return create<PersistedSettingsState<T>>((set) => {
    void window.api
      ?.loadSettings(key)
      .then((raw) => {
        if (raw) set({ values: mergeWithDefaults(raw) })
      })
      .catch(() => undefined)

    return {
      values: defaults,
      update: (patch) =>
        set((state) => {
          const values = { ...state.values, ...patch }
          persist(values)
          return { values }
        }),
      reset: () => {
        persist(defaults)
        set({ values: defaults })
      }
    }
  })
}
