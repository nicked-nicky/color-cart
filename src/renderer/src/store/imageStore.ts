import { create } from 'zustand'

interface ImageStoreState {
  filePath: string | null
  url: string | null
  setImage: (image: { path: string | null; url: string } | null) => void
}

export const useImageStore = create<ImageStoreState>((set) => ({
  filePath: null,
  url: null,
  setImage: (image) => set({ filePath: image?.path ?? null, url: image?.url ?? null })
}))
