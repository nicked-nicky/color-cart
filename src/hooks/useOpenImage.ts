import { useCallback } from 'react'
import { useNotifications } from '@stella-componente/terra'
import { pickImage } from '@/platform'
import { errorMessage } from '@/lib/errorMessage'
import { useImageStore } from '@/store/imageStore'

/** Returns a handler that asks the user for a picture and loads it. */
export function useOpenImage(): () => void {
  const setImage = useImageStore((state) => state.setImage)
  const notify = useNotifications()

  return useCallback(() => {
    pickImage().then(
      (image) => image && setImage(image),
      (error) => notify.error(errorMessage(error, "Couldn't open the image."))
    )
  }, [setImage, notify])
}
