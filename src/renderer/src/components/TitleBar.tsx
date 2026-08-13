import { JSX, useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  // Optional chaining guards against the preload failing to load (or this
  // component ever being rendered outside Electron, e.g. a plain browser
  // tab during dev) so it degrades instead of crashing the whole tree.
  const windowApi = window.api?.window

  useEffect(() => {
    if (!windowApi) return
    void windowApi.isMaximized().then(setIsMaximized)
    const unsubscribe = windowApi.onMaximizeChange(setIsMaximized)
    return unsubscribe
  }, [windowApi])

  return (
    <header
      className="flex h-9 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 [-webkit-app-region:drag]"
      onDoubleClick={() => void windowApi?.toggleMaximize()}
    >
      <div className="flex items-center gap-2 pl-3">
        <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-fuchsia-500 to-sky-500" />
        <span className="text-xs font-medium text-neutral-400">color-basket</span>
      </div>

      <div className="flex h-full [-webkit-app-region:no-drag]">
        <button
          type="button"
          aria-label="Minimize"
          onClick={() => void windowApi?.minimize()}
          className="flex h-full w-11 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          onClick={() => void windowApi?.toggleMaximize()}
          className="flex h-full w-11 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={() => void windowApi?.close()}
          className="flex h-full w-11 items-center justify-center text-neutral-400 transition-colors hover:bg-red-600 hover:text-neutral-100"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  )
}

export default TitleBar
