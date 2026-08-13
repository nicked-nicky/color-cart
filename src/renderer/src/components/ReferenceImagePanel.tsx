import { JSX } from 'react'
import { ImageIcon, FolderOpen } from 'lucide-react'
import { useImageStore } from '@renderer/store/imageStore'

function ReferenceImagePanel(): JSX.Element {
  const url = useImageStore((state) => state.url)
  const setImage = useImageStore((state) => state.setImage)

  const handleOpen = async (): Promise<void> => {
    const image = await window.api?.openImage()
    if (image) setImage(image)
  }

  if (url) {
    return (
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-neutral-900">
        <img src={url} alt="Reference" className="max-h-full max-w-full object-contain" />
        <button
          type="button"
          onClick={() => void handleOpen()}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-950/80 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur transition-colors hover:border-neutral-500 hover:text-neutral-100"
        >
          <FolderOpen size={14} />
          Change image
        </button>
      </section>
    )
  }

  return (
    <section className="flex flex-1 items-center justify-center border-r border-neutral-800 bg-neutral-900">
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-700 px-16 py-14 text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-300"
      >
        <ImageIcon size={36} />
        <span className="text-sm">Click to open a reference image</span>
      </button>
    </section>
  )
}

export default ReferenceImagePanel
