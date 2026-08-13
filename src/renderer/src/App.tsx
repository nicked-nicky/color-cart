import { JSX, useEffect } from 'react'
import { animate, stagger } from 'animejs'
import TitleBar from './components/TitleBar'
import ReferenceImagePanel from './components/ReferenceImagePanel'
import PaletteBasketPanel from './components/PaletteBasketPanel'

function App(): JSX.Element {
  useEffect(() => {
    animate('.panel-animate', {
      opacity: [0, 1],
      duration: 420,
      delay: stagger(90),
      ease: 'outQuad'
    })
  }, [])

  return (
    <div className="flex h-screen w-screen flex-col gap-[5px] overflow-hidden bg-neutral-900 p-[5px] text-neutral-100">
      <TitleBar />
      <main className="flex flex-1 gap-[5px] overflow-hidden">
        <div className="panel-animate flex flex-1 opacity-0">
          <ReferenceImagePanel />
        </div>
        <div className="panel-animate opacity-0">
          <PaletteBasketPanel />
        </div>
      </main>
    </div>
  )
}

export default App
