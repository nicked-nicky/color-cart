import type { JSX, ReactNode } from 'react'
import { Button, ButtonIsland, Tooltip, type ButtonSize, type Grade } from '@stella-componente/terra'

interface ChoiceOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface ChoiceIslandProps<T extends string> {
  options: ReadonlyArray<ChoiceOption<T>>
  value: T
  onValueChange: (value: T) => void
  iconOnly?: boolean
  size?: ButtonSize
  parentGrade?: Grade
  'aria-labelledby'?: string
}

export function ChoiceIsland<T extends string>({
  options,
  value,
  onValueChange,
  iconOnly = false,
  size = 'sm',
  parentGrade,
  'aria-labelledby': labelledBy
}: ChoiceIslandProps<T>): JSX.Element {
  return (
    <ButtonIsland
      size={size}
      parentGrade={parentGrade}
      role="radiogroup"
      aria-labelledby={labelledBy}
      data-stella-component="choice-island"
    >
      {options.map((option) => {
        const selected = option.value === value
        const button = (
          <Button
            key={option.value}
            role="radio"
            aria-checked={selected}
            aria-label={iconOnly ? option.label : undefined}
            active={selected}
            iconOnly={iconOnly}
            leadingIcon={iconOnly ? undefined : option.icon}
            onClick={() => onValueChange(option.value)}
          >
            {iconOnly ? option.icon : option.label}
          </Button>
        )
        return iconOnly ? (
          <Tooltip key={option.value} label={option.label}>
            {button}
          </Tooltip>
        ) : (
          button
        )
      })}
    </ButtonIsland>
  )
}

ChoiceIsland.displayName = 'ChoiceIsland'

export type { ChoiceIslandProps, ChoiceOption }
