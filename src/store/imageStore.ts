import { create } from 'zustand'
import type { LoadedImage } from '@/platform'

interface ImageStoreState {
  filePath: string | null
  url: string | null
  setImage: (image: LoadedImage | null) => void
}

export const useImageStore = create<ImageStoreState>((set, get) => ({
  filePath: null,
  url: null,
  setImage: (image) => {
    const previousUrl = get().url
    set({ filePath: image?.path ?? null, url: image?.url ?? null })
    if (previousUrl && previousUrl !== image?.url && previousUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl)
    }
  }
}))
