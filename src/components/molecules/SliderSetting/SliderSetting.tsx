import type { JSX, ReactNode } from 'react'
import { Slider, type Grade } from '@stella-componente/terra'
import { SettingRow } from '@/components/molecules/SettingRow'
import styles from './SliderSetting.module.css'

interface SliderSettingProps {
  label: ReactNode
  description?: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onValueChange: (value: number) => void
  grade?: Grade
}

export function SliderSetting({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  onValueChange,
  grade
}: SliderSettingProps): JSX.Element {
  return (
    <SettingRow label={label} description={description} grade={grade}>
      {(labelId) => (
        <div data-stella-component="slider-setting" className={styles.control}>
          <Slider
            size="sm"
            min={min}
            max={max}
            step={step}
            value={value}
            onValueChange={onValueChange}
            aria-labelledby={labelId}
            grade={grade}
          />
        </div>
      )}
    </SettingRow>
  )
}

SliderSetting.displayName = 'SliderSetting'

export type { SliderSettingProps }
