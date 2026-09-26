import { create, type UseBoundStore, type StoreApi } from 'zustand'
import { loadSetting, saveSetting } from '@/platform'

const PERSIST_DEBOUNCE_MS = 300

export interface PersistedSettingsState<T> {
  values: T
  update: (patch: Partial<T>) => void
  reset: () => void
}

/**
 * Factory for the "a plain settings object with update()/reset()" shape,
 * shared by every settings category. Hydrates from the app's settings
 * store (keyed by `key`) on creation, and debounce-persists on every
 * change — the store still initializes synchronously with `defaults` so
 * consumers never have to handle a loading state.
 */
export function createPersistedSettingsStore<T extends object>(
  key: string,
  defaults: T,
  sanitize: (raw: Partial<T>) => T = (raw) => ({ ...defaults, ...raw })
): UseBoundStore<StoreApi<PersistedSettingsState<T>>> {
  let persistTimer: number | null = null

  function persist(values: T): void {
    if (persistTimer !== null) window.clearTimeout(persistTimer)
    persistTimer = window.setTimeout(() => {
      void saveSetting(key, values).catch(() => undefined)
    }, PERSIST_DEBOUNCE_MS)
  }

  return create<PersistedSettingsState<T>>((set) => {
    void loadSetting<Partial<T>>(key)
      .then((raw) => {
        if (raw && typeof raw === 'object') set({ values: sanitize(raw) })
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
