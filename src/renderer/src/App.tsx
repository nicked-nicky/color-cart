import { JSX, useEffect } from 'react'
import { animate, stagger } from 'animejs'
import TitleBar from './components/organisms/TitleBar'
import ReferenceImagePanel from './components/organisms/ReferenceImagePanel'
import PaletteBasketPanel from './components/organisms/PaletteBasketPanel'
import SettingsModal from './components/organisms/SettingsModal'

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
    <div className="flex h-screen w-screen flex-col gap-2.5 overflow-hidden bg-canvas p-2.5 text-ink">
      <TitleBar />
      <main className="flex flex-1 gap-2.5 overflow-hidden">
        <div className="panel-animate flex flex-1 opacity-0">
          <ReferenceImagePanel />
        </div>
        <div className="panel-animate opacity-0">
          <PaletteBasketPanel />
        </div>
      </main>
      <SettingsModal />
    </div>
  )
}

export default App
