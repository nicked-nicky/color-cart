/**
 * Adapts an asynchronously registered listener to a synchronous effect
 * cleanup. If the cleanup runs before registration settles, the listener is
 * removed as soon as it arrives.
 */
export function disposeWhenReady(pending: Promise<() => void>): () => void {
  let stop: (() => void) | null = null
  let disposed = false
  void pending.then((unlisten) => {
    if (disposed) unlisten()
    else stop = unlisten
  })
  return () => {
    disposed = true
    stop?.()
  }
}
