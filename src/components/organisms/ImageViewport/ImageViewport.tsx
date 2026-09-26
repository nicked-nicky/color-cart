import {
  useCallback,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type JSX,
  type MouseEvent as ReactMouseEvent
} from 'react'
import { FolderOpen, ImageIcon } from 'lucide-react'
import {
  Button,
  ButtonIsland,
  EmptyState,
  Icon,
  Island,
  Text,
  useNotifications
} from '@stella-componente/terra'
import type { SourceCoordinates } from '@/types'
import { cx } from '@/lib/cx'
import { imageFromFile, isDesktop } from '@/platform'
import { useImageStore } from '@/store/imageStore'
import { usePaletteStore } from '@/store/paletteStore'
import { useZoomPan } from '@/hooks/useZoomPan'
import { useColorPicker } from '@/hooks/useColorPicker'
import { useOpenImage } from '@/hooks/useOpenImage'
import { ZoomControl } from '@/components/molecules/ZoomControl'
import { Navigator } from '@/components/molecules/Navigator'
import { Loupe } from '@/components/molecules/Loupe'
import styles from './ImageViewport.module.css'

interface ImageViewportProps {
  dropHover: boolean
}

export function ImageViewport({ dropHover }: ImageViewportProps): JSX.Element {
  const url = useImageStore((state) => state.url)
  const setImage = useImageStore((state) => state.setImage)
  const addColor = usePaletteStore((state) => state.addColor)
  const notify = useNotifications()
  const openImage = useOpenImage()

  const imgRef = useRef<HTMLImageElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [browserDragOver, setBrowserDragOver] = useState(false)

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
  } = useZoomPan({ imgRef, sectionRef: stageRef, imageUrl: url })

  const handlePick = useCallback(
    (hex: string, coordinates: SourceCoordinates) => {
      const result = addColor(hex, coordinates)
      if (!result.added) notify.info(`${hex.toUpperCase()} is already in the palette.`)
    },
    [addColor, notify]
  )

  const { loupeStyle, handleImageLoad, handlePickMouseDown } = useColorPicker({
    imgRef,
    imageUrl: url,
    onPick: handlePick
  })

  const handleImageMouseDown = (event: ReactMouseEvent<HTMLImageElement>): void => {
    if (handlePanMouseDown(event)) return
    handlePickMouseDown(event)
  }

  const browserDropHandlers = isDesktop
    ? {}
    : {
        onDragOver: (event: ReactDragEvent<HTMLDivElement>) => {
          event.preventDefault()
          setBrowserDragOver(true)
        },
        onDragLeave: (event: ReactDragEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setBrowserDragOver(false)
          }
        },
        onDrop: (event: ReactDragEvent<HTMLDivElement>) => {
          event.preventDefault()
          setBrowserDragOver(false)
          const file = event.dataTransfer.files[0]
          if (!file) return
          const image = imageFromFile(file)
          if (image) setImage(image)
          else notify.warning(`"${file.name}" isn't a supported image type.`)
        }
      }

  const cursorClass = isPanning ? styles.panning : loupeStyle ? styles.picking : styles.idle

  return (
    <Island as="section" grade="global" className={styles.viewport} aria-label="Reference image">
      <div
        ref={stageRef}
        data-stella-component="image-viewport"
        className={styles.stage}
        onWheel={url ? handleWheel : undefined}
        {...browserDropHandlers}
      >
        {url ? (
          <>
            <img
              ref={imgRef}
              src={url}
              alt="Reference"
              draggable={false}
              onLoad={handleImageLoad}
              onMouseDown={handleImageMouseDown}
              className={cx(styles.image, !isPanning && styles.animated, cursorClass)}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            />
            <div className={styles.zoomDock}>
              <ZoomControl
                percent={currentPercent}
                options={zoomOptions}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onSelect={setZoomPercent}
                parentGrade="global"
              />
            </div>
            <Navigator
              imageUrl={url}
              aspectRatio={baseSize ? baseSize.width / baseSize.height : 1}
              rect={navigatorRect ?? { left: 0, top: 0, width: 100, height: 100 }}
              visible={navigatorVisible}
              onPan={panToImageFraction}
            />
            {loupeStyle && <Loupe style={loupeStyle} />}
          </>
        ) : (
          <EmptyState
            icon={<ImageIcon />}
            title="No reference image"
            description="Choose a picture or drop one here, then click and hold on it to pick colors."
          >
            <ButtonIsland parentGrade="global">
              <Button
                leadingIcon={
                  <Icon size="sm">
                    <FolderOpen />
                  </Icon>
                }
                onClick={openImage}
              >
                Choose a picture
              </Button>
            </ButtonIsland>
          </EmptyState>
        )}

        {(dropHover || browserDragOver) && (
          <div data-stella-grade="elevated" className={styles.dropOverlay}>
            <Text variant="title-3">Drop to load image</Text>
          </div>
        )}
      </div>
    </Island>
  )
}

ImageViewport.displayName = 'ImageViewport'

export type { ImageViewportProps }
