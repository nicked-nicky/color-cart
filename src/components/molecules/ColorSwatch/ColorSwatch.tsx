import { useState, type HTMLAttributes, type JSX } from 'react'
import { Copy, Ellipsis, Trash2 } from 'lucide-react'
import {
  Button,
  ButtonIsland,
  Icon,
  Menu,
  Text,
  Tooltip,
  pointAnchor,
  type Anchor,
  type Grade
} from '@stella-componente/terra'
import type { PaletteColor } from '@/types'
import { nameColor } from '@/lib/colorName'
import { formatHex, formatOklch, formatRgb } from '@/lib/colorFormat'
import { cx } from '@/lib/cx'
import { ColorDisc } from '@/components/atoms/ColorDisc'
import styles from './ColorSwatch.module.css'

interface ColorSwatchProps {
  color: PaletteColor
  onRemove: (id: string) => void
  onCopy: (text: string, formatLabel: string) => void
  handleProps?: HTMLAttributes<HTMLDivElement>
  dragging?: boolean
  dropTarget?: boolean
  grade?: Grade
}

export function ColorSwatch({
  color,
  onRemove,
  onCopy,
  handleProps,
  dragging = false,
  dropTarget = false,
  grade = 'default'
}: ColorSwatchProps): JSX.Element {
  const [moreButton, setMoreButton] = useState<HTMLButtonElement | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<Anchor | null>(null)
  const name = nameColor(color.oklch)
  const hex = formatHex(color.hex)

  return (
    <div
      data-stella-component="color-swatch"
      data-stella-grade={grade}
      className={cx(styles.swatch, dragging && styles.dragging, dropTarget && styles.dropTarget)}
      onContextMenu={(event) => {
        event.preventDefault()
        setMenuAnchor(pointAnchor(event.clientX, event.clientY))
      }}
    >
      <ColorDisc
        hex={color.hex}
        size="xl"
        role="img"
        aria-label={`${name}, ${hex}`}
        {...handleProps}
        className={cx(styles.handle, handleProps?.className)}
      />
      <Text variant="caption" truncate title={name} className={styles.label}>
        {name}
      </Text>
      <Text variant="mono" color="secondary" className={styles.label}>
        {hex}
      </Text>
      <ButtonIsland size="xs" parentGrade={grade}>
        <Tooltip label="Copy HEX">
          <Button iconOnly aria-label={`Copy ${hex}`} onClick={() => onCopy(hex, 'HEX')}>
            <Copy />
          </Button>
        </Tooltip>
        <Button
          ref={setMoreButton}
          iconOnly
          aria-label={`More actions for ${hex}`}
          aria-haspopup="menu"
          active={menuAnchor !== null}
          onClick={() => setMenuAnchor(moreButton)}
        >
          <Ellipsis />
        </Button>
      </ButtonIsland>
      <Menu open={menuAnchor !== null} onClose={() => setMenuAnchor(null)} anchor={menuAnchor}>
        <Menu.Item onSelect={() => onCopy(hex, 'HEX')}>Copy HEX</Menu.Item>
        <Menu.Item onSelect={() => onCopy(formatRgb(color.rgb), 'RGB')}>Copy RGB</Menu.Item>
        <Menu.Item onSelect={() => onCopy(formatOklch(color.oklch), 'OKLCH')}>Copy OKLCH</Menu.Item>
        <Menu.Separator />
        <Menu.Item
          destructive
          leadingIcon={
            <Icon size="sm">
              <Trash2 />
            </Icon>
          }
          onSelect={() => onRemove(color.id)}
        >
          Remove
        </Menu.Item>
      </Menu>
    </div>
  )
}

ColorSwatch.displayName = 'ColorSwatch'

export type { ColorSwatchProps }
