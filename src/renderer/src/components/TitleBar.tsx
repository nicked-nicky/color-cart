import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    void window.api.window.isMaximized().then(setIsMaximized)
    const unsubscribe = window.api.window.onMaximizeChange(setIsMaximized)
    return unsubscribe
  }, [])

  return (
    <header
      className="flex h-9 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 [-webkit-app-region:drag]"
      onDoubleClick={() => void window.api.window.toggleMaximize()}
    >
      <div className="flex items-center gap-2 pl-3">
        <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-fuchsia-500 to-sky-500" />
        <span className="text-xs font-medium text-neutral-400">color-basket</span>
      </div>

      <div className="flex h-full [-webkit-app-region:no-drag]">
        <button
          type="button"
          aria-label="Minimize"
          onClick={() => void window.api.window.minimize()}
          className="flex h-full w-11 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          onClick={() => void window.api.window.toggleMaximize()}
          className="flex h-full w-11 items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={() => void window.api.window.close()}
          className="flex h-full w-11 items-center justify-center text-neutral-400 transition-colors hover:bg-red-600 hover:text-neutral-100"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  )
}

export default TitleBar
