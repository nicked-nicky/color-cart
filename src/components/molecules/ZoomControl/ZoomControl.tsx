import { useState, type JSX } from 'react'
import { ChevronUp, Minus, Plus } from 'lucide-react'
import { Button, ButtonIsland, Icon, Menu, Tooltip, type Grade } from '@stella-componente/terra'
import styles from './ZoomControl.module.css'

interface ZoomControlProps {
  percent: number
  options: number[]
  onZoomIn: () => void
  onZoomOut: () => void
  onSelect: (percent: number) => void
  parentGrade?: Grade
}

export function ZoomControl({
  percent,
  options,
  onZoomIn,
  onZoomOut,
  onSelect,
  parentGrade
}: ZoomControlProps): JSX.Element {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <ButtonIsland
        size="sm"
        floating
        parentGrade={parentGrade}
        data-stella-component="zoom-control"
      >
        <Tooltip label="Zoom out">
          <Button iconOnly aria-label="Zoom out" onClick={onZoomOut}>
            <Minus />
          </Button>
        </Tooltip>
        <Button
          ref={setAnchor}
          aria-label={`Zoom level ${percent}%`}
          aria-haspopup="menu"
          aria-expanded={open}
          active={open}
          trailingIcon={
            <Icon size="sm">
              <ChevronUp />
            </Icon>
          }
          onClick={() => setOpen((isOpen) => !isOpen)}
          className={styles.level}
        >
          {percent}%
        </Button>
        <Tooltip label="Zoom in">
          <Button iconOnly aria-label="Zoom in" onClick={onZoomIn}>
            <Plus />
          </Button>
        </Tooltip>
      </ButtonIsland>
      <Menu open={open} onClose={() => setOpen(false)} anchor={anchor} placement="top">
        {options.map((option) => (
          <Menu.Item key={option} active={option === percent} onSelect={() => onSelect(option)}>
            {option}%
          </Menu.Item>
        ))}
      </Menu>
    </>
  )
}

ZoomControl.displayName = 'ZoomControl'

export type { ZoomControlProps }
