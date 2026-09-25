import { useState, type JSX } from 'react'
import { Palette, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  ButtonIsland,
  Dialog,
  EmptyState,
  FlexContainer,
  Icon,
  Island,
  ScrollArea,
  Text,
  useNotifications
} from '@stella-componente/terra'
import { usePaletteStore } from '@/store/paletteStore'
import { useSwatchReorder } from '@/hooks/useSwatchReorder'
import { copyTextToClipboard } from '@/platform'
import { ColorSwatch } from '@/components/molecules/ColorSwatch'
import styles from './PaletteBasket.module.css'

export function PaletteBasket(): JSX.Element {
  const colors = usePaletteStore((state) => state.colors)
  const removeColor = usePaletteStore((state) => state.removeColor)
  const reorderColors = usePaletteStore((state) => state.reorderColors)
  const clear = usePaletteStore((state) => state.clear)
  const notify = useNotifications()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { draggingIndex, dropTargetIndex, handlePropsFor } = useSwatchReorder(reorderColors)

  const handleCopy = (text: string, formatLabel: string): void => {
    copyTextToClipboard(text).then(
      () => notify.success(`Copied ${formatLabel}: ${text}`),
      () => notify.error("Couldn't copy to the clipboard.")
    )
  }

  const handleClear = (): void => {
    clear()
    setConfirmOpen(false)
  }

  return (
    <Island as="aside" grade="default" padding="4" className={styles.basket} aria-label="Palette">
      <FlexContainer direction="column" gap="3" grow className={styles.content}>
        <FlexContainer align="center" justify="between">
          <Text variant="title-3" as="h2">
            Palette
          </Text>
          <Badge variant="tinted">{colors.length}</Badge>
        </FlexContainer>

        {colors.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<Palette />}
            title="No colors yet"
            description="Click and hold on the reference image to pick a color."
            className={styles.empty}
          />
        ) : (
          <ScrollArea grow className={styles.scroll}>
            <div role="list" className={styles.grid}>
              {colors.map((color, index) => (
                <div role="listitem" key={color.id} data-swatch-index={index}>
                  <ColorSwatch
                    color={color}
                    onRemove={removeColor}
                    onCopy={handleCopy}
                    handleProps={handlePropsFor(index)}
                    dragging={draggingIndex === index}
                    dropTarget={dropTargetIndex === index}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {colors.length > 0 && (
          <ButtonIsland size="sm" parentGrade="default">
            <Button
              leadingIcon={
                <Icon size="sm">
                  <Trash2 />
                </Icon>
              }
              onClick={() => setConfirmOpen(true)}
            >
              Clear all
            </Button>
          </ButtonIsland>
        )}
      </FlexContainer>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <Dialog.Header>
          <Dialog.Title>Clear the palette?</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Text as="p" color="secondary">
            This removes all {colors.length} colors. It can&apos;t be undone.
          </Text>
        </Dialog.Body>
        <Dialog.Footer>
          <ButtonIsland size="sm" parentGrade="global">
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleClear}>Clear all</Button>
          </ButtonIsland>
        </Dialog.Footer>
      </Dialog>
    </Island>
  )
}

PaletteBasket.displayName = 'PaletteBasket'
