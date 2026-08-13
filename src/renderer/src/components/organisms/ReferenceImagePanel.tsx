import {
  JSX,
  useCallback,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent
} from 'react'
import { animate } from 'animejs'
import { ImageIcon } from 'lucide-react'
import { useImageStore } from '@renderer/store/imageStore'
import { usePaletteStore } from '@renderer/store/paletteStore'
import { useToastStore } from '@renderer/store/toastStore'
import { useZoomPan } from '@renderer/hooks/useZoomPan'
import { useColorPicker } from '@renderer/hooks/useColorPicker'
import ZoomControl from '../molecules/ZoomControl'
import Navigator from '../molecules/Navigator'

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

function ReferenceImagePanel(): JSX.Element {
  const url = useImageStore((state) => state.url)
  const setImage = useImageStore((state) => state.setImage)
  const addColor = usePaletteStore((state) => state.addColor)
  const pushToast = useToastStore((state) => state.pushToast)

  const imgRef = useRef<HTMLImageElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const {
    zoom,
    pan,
    isPanning,
    currentPercent,
    zoomOptions,
    baseSize,
    navigatorRect,
    navigatorVisible,
    handleWheel,
    handlePanMouseDown,
    setZoomPercent,
    zoomIn,
    zoomOut,
    panToImageFraction
  } = useZoomPan({ imgRef, sectionRef, imageUrl: url })

  const { loupeStyle, handleImageLoad, handlePickMouseDown } = useColorPicker({
    imgRef,
    imageUrl: url,
    onPick: addColor
  })

  const handleOpen = async (): Promise<void> => {
    const image = await window.api?.openImage()
    if (image) setImage(image)
  }

  const handleImageMouseDown = (event: ReactMouseEvent<HTMLImageElement>): void => {
    if (handlePanMouseDown(event)) return
    handlePickMouseDown(event)
  }

  const handleDragOver = (event: ReactDragEvent<HTMLElement>): void => {
    event.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (event: ReactDragEvent<HTMLElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingOver(false)
    }
  }

  const loadDroppedFile = async (file: File): Promise<void> => {
    const path = window.api?.getPathForFile(file)
    if (path) {
      const image = await window.api.readImageFile(path)
      if (image) setImage(image)
      else pushToast(`Couldn't load "${file.name}" — unsupported or unreadable image file.`)
      return
    }
    const url = await readFileAsDataUrl(file)
    if (url) setImage({ path: null, url })
    else pushToast(`Couldn't load "${file.name}".`)
  }

  const handleDrop = (event: ReactDragEvent<HTMLElement>): void => {
    event.preventDefault()
    setIsDraggingOver(false)
    const file = event.dataTransfer.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      pushToast(`"${file.name}" isn't a supported image type.`)
      return
    }
    void loadDroppedFile(file)
  }

  const dropOverlay = isDraggingOver ? (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-accent/70 bg-black/30">
      <span className="text-sm font-medium text-ink">Drop to load image</span>
    </div>
  ) : null

  const animateLoupe = useCallback((node: HTMLDivElement | null): void => {
    if (!node) return
    animate(node, {
      opacity: [0, 1],
      duration: 150,
      ease: 'outQuad'
    })
  }, [])

  if (url) {
    const cursorClass = isPanning ? 'cursor-grabbing' : loupeStyle ? 'cursor-none' : 'cursor-crosshair'

    return (
      <section
        ref={sectionRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-black/30"
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <img
          ref={imgRef}
          src={url}
          alt="Reference"
          draggable={false}
          onLoad={handleImageLoad}
          onMouseDown={handleImageMouseDown}
          className={`max-h-full max-w-full select-none object-contain ${
            isPanning ? '' : 'transition-transform duration-75 ease-out'
          } ${cursorClass}`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <ZoomControl
            percent={currentPercent}
            options={zoomOptions}
            onZoomOut={zoomOut}
            onZoomIn={zoomIn}
            onSelect={setZoomPercent}
          />
        </div>

        <Navigator
          imageUrl={url}
          aspectRatio={baseSize ? baseSize.width / baseSize.height : 1}
          rect={navigatorRect ?? { left: 0, top: 0, width: 100, height: 100 }}
          visible={navigatorVisible}
          onPan={panToImageFraction}
        />

        {loupeStyle && (
          <div
            ref={animateLoupe}
            className="pointer-events-none fixed z-50 overflow-hidden rounded-full border-4 opacity-0 shadow-2xl"
            style={loupeStyle}
          >
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white mix-blend-difference" />
          </div>
        )}
        {dropOverlay}
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface shadow-lg shadow-black/30"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-subtle px-16 py-14 text-ink-faint transition-colors hover:border-border hover:text-ink-muted"
      >
        <ImageIcon size={40} />
        <span className="text-sm">Click to open a reference image</span>
      </button>
      {dropOverlay}
    </section>
  )
}

export default ReferenceImagePanel
