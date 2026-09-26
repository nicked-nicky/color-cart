import { useEffect, useMemo, useState } from 'react'
import type { WindowControlsHandlers } from '@stella-componente/terra'
import { createWindowControls, listenForMaximizeChange } from '@/platform'
import { disposeWhenReady } from '@/lib/disposeWhenReady'

const handlers = createWindowControls()

/** Minimize / maximize / close handlers plus the live maximized state. */
export function useWindowControls(): WindowControlsHandlers {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => disposeWhenReady(listenForMaximizeChange(setMaximized)), [])

  return useMemo(() => ({ ...handlers, maximized }), [maximized])
}
