import { useEffect, useState } from 'react'
import { useNotifications } from '@stella-componente/terra'
import { listenForImageDrops } from '@/platform'
import { disposeWhenReady } from '@/lib/disposeWhenReady'
import { errorMessage } from '@/lib/errorMessage'
import { useImageStore } from '@/store/imageStore'

export function useDesktopImageDrops(): boolean {
  const setImage = useImageStore((state) => state.setImage)
  const notify = useNotifications()
  const [hovering, setHovering] = useState(false)

  useEffect(
    () =>
      disposeWhenReady(
        listenForImageDrops({
          onHover: setHovering,
          onImage: setImage,
          onRejected: (fileName) =>
            notify.warning(
              fileName
                ? `"${fileName}" isn't a supported image type.`
                : "That file type isn't supported."
            ),
          onError: (error) => notify.error(errorMessage(error, "Couldn't load the dropped image."))
        })
      ),
    [setImage, notify]
  )

  return hovering
}
